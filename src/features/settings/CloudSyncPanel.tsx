import { useEffect, useState, type FormEvent } from 'react';
import { Check, Cloud, CloudOff, Copy, Eye, EyeOff, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { Button, Panel, SegmentedControl, cx, inputClass } from '../../components/ui';
import { useCloudSync } from '../../hooks/useCloudSync';
import { SUPABASE_PROJECT_REF } from '../../lib/cloud/config';
import { formatDate } from '../../lib/dates';
import schemaSql from '../../../supabase/schema.sql?raw';

const RESEND_SECONDS = 60;

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
  return formatDate(iso);
}

export function CloudSyncPanel() {
  const cloud = useCloudSync();
  if (cloud.status === 'disabled') return null;
  const signedIn = cloud.email !== null || ['synced', 'syncing', 'offline', 'needs-setup'].includes(cloud.status);

  return (
    <Panel className="mb-6 overflow-hidden">
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        <span className={cx('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg', cloud.status === 'synced' ? 'bg-success/10 text-success' : 'bg-surface-3 text-muted')}>
          {cloud.status === 'offline' || cloud.status === 'error' || cloud.status === 'needs-setup' ? <CloudOff className="size-4" /> : <Cloud className="size-4" />}
        </span>
        <div className="min-w-0">
          <p className="font-medium">Cloud sync</p>
          <p className="mt-0.5 text-[13px] text-muted">
            Keep your progress, notes, checkpoints, exams and calendar identical on every device you sign in on.
          </p>
        </div>
      </div>
      {signedIn ? <SignedIn /> : <SignIn />}
    </Panel>
  );
}

function SignedIn() {
  const cloud = useCloudSync();
  const [, tick] = useState(0);
  // Refresh "synced 2 min ago" without extra state.
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const syncing = cloud.status === 'syncing' || busy;
  const statusText: Record<string, string> = {
    synced: `Up to date · synced ${timeAgo(cloud.lastSyncedAt)}`,
    syncing: 'Syncing…',
    checking: 'Checking your session…',
    offline: `Offline. Your changes are saved on this device and will upload when you are back online.${cloud.lastSyncedAt ? ` Last synced ${timeAgo(cloud.lastSyncedAt)}.` : ''}`,
    'needs-setup': 'Sync is paused until the cloud table exists.',
    error: 'Sync problem.',
  };
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <div>
        <p className="text-[12px] text-subtle">Signed in as</p>
        <p className="font-medium">{cloud.email ?? '…'}</p>
      </div>
      <p className={cx('flex items-center gap-2 text-[13px]', cloud.status === 'synced' ? 'text-success' : cloud.status === 'error' || cloud.status === 'needs-setup' ? 'text-danger' : 'text-muted')}>
        {syncing ? <Loader2 className="size-4 animate-spin" /> : cloud.status === 'synced' ? <Check className="size-4" /> : null}
        {statusText[cloud.status] ?? ''}
      </p>
      {cloud.error && cloud.status !== 'offline' && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {cloud.error}
        </p>
      )}
      {cloud.status === 'needs-setup' && (
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(schemaSql);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2500);
            } catch {
              /* clipboard unavailable: the SQL is also in supabase/schema.sql */
            }
          }}
        >
          <Copy className="size-4" /> {copied ? 'Copied. Paste it in the SQL Editor and Run' : 'Copy the setup SQL'}
        </Button>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            setBusy(true);
            try {
              await cloud.syncNow();
            } finally {
              setBusy(false);
            }
          }}
          disabled={syncing}
        >
          <RefreshCw className={cx('size-4', syncing && 'animate-spin')} /> Sync now
        </Button>
        <Button variant="ghost" onClick={() => void cloud.signOut()}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
      <p className="text-[12px] text-subtle">
        Signing out keeps your progress on this device. Importing a file or resetting progress also replaces the cloud copy, and your other devices will receive it.
      </p>
    </div>
  );
}

function EmailCodeSignIn() {
  const cloud = useCloudSync();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!emailValid || busy || cooldown > 0) return;
    setBusy(true);
    setProblem(null);
    try {
      await cloud.sendCode(email);
      setSentTo(email.trim());
      setCode('');
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'Could not send the code.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (!sentTo || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      await cloud.verifyCode(sentTo, code);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'That code did not work.');
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <form onSubmit={verify} className="flex flex-col gap-3 px-5 py-4">
        <p className="text-[13px] text-muted">
          We sent a code to <span className="text-fg">{sentTo}</span>. Enter it here. You can read the email on any device.
        </p>
        <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
          Code from the email
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            className={cx(inputClass, 'max-w-48 font-mono tracking-widest')}
            autoFocus
          />
        </label>
        {problem && (
          <p role="alert" className="text-[13px] text-danger">
            {problem}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" disabled={code.length < 6 || busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} Sign in
          </Button>
          <Button variant="ghost" onClick={() => void send()} disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </Button>
          <Button variant="ghost" onClick={() => { setSentTo(null); setProblem(null); }}>
            Use another email
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-3 px-5 py-4">
      <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className={cx(inputClass, 'max-w-sm')} />
      </label>
      {problem && (
        <p role="alert" className="text-[13px] text-danger">
          {problem}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={!emailValid || busy}>
          {busy && <Loader2 className="size-4 animate-spin" />} Email me a code
        </Button>
      </div>
      <p className="text-[12px] text-subtle">No password. Your progress is stored privately and only you can read it. Until you sign in, everything stays in this browser.</p>
    </form>
  );
}

type SignInMode = 'password' | 'code';

function SignIn() {
  const [mode, setMode] = useState<SignInMode>('password');
  return (
    <div>
      <div className="px-5 pt-4">
        <SegmentedControl
          label="Sign-in method"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'password', label: 'Password' },
            { value: 'code', label: 'Email code' },
          ]}
        />
      </div>
      {mode === 'password' ? <PasswordSignIn /> : <EmailCodeSignIn />}
      {SUPABASE_PROJECT_REF && (
        <p className="border-t border-line px-5 py-3 text-[12px] text-subtle">
          Connected to Supabase project <span className="font-mono text-muted">{SUPABASE_PROJECT_REF}</span>. The user must be created in this project.
        </p>
      )}
    </div>
  );
}

function PasswordSignIn() {
  const cloud = useCloudSync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const valid = /^\S+@\S+\.\S+$/.test(email.trim()) && password.length >= 6;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      await cloud.signInWithPassword(email, password);
    } catch (err) {
      const base = err instanceof Error ? err.message : 'Could not sign in.';
      const spaces = password !== password.trim() ? ' Your password starts or ends with a space.' : '';
      setProblem(base + spaces);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 px-5 py-4">
      <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
        Email
        <input type="email" name="username" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="you@example.com" className={cx(inputClass, 'max-w-sm')} />
      </label>
      <div className="flex flex-col gap-1.5 text-[12px] text-subtle">
        <label htmlFor="cloud-password">Password</label>
        <div className="relative max-w-sm">
          <input
            id="cloud-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={cx(inputClass, 'pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-subtle hover:bg-surface-3 hover:text-fg"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {problem && (
        <p role="alert" className="text-[13px] text-danger">
          {problem}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={!valid || busy}>
          {busy && <Loader2 className="size-4 animate-spin" />} Sign in
        </Button>
      </div>
      <p className="text-[12px] text-subtle">
        The account is created by you in Supabase: <span className="text-muted">Authentication → Users → Add user → Create new user</span>, with “Auto Confirm User” ticked. No emails are involved.
      </p>
    </form>
  );
}
