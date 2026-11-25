/**
 * In-browser TypeScript: real type checking (strict mode) and transpiling, loaded lazily
 * the first time a TypeScript or React problem runs.
 */
import type * as TS from 'typescript';
import type { TestResult, TypeTest } from '../../types/checkpoint';

type TsModule = typeof TS;

const libLoaders = import.meta.glob(
  [
    '/node_modules/typescript/lib/lib.es5.d.ts',
    '/node_modules/typescript/lib/lib.es20{15,16,17,18,19,20}*.d.ts',
    '/node_modules/typescript/lib/lib.decorators*.d.ts',
    '!/node_modules/typescript/lib/*.full.d.ts',
  ],
  { query: '?raw', import: 'default' },
) as Record<
  string,
  () => Promise<string>
>;
// Only the libraries needed for target ES2020 (no DOM): the scope of every problem.
const NEEDED_LIB = /\/lib\.(es5|es20(1[5-9]|20)(\.[a-z.]+)?|decorators(\.legacy)?)\.d\.ts$/;

let tsPromise: Promise<TsModule> | null = null;
let libsPromise: Promise<Map<string, string>> | null = null;
const libSourceCache = new Map<string, TS.SourceFile>();

function loadTs(): Promise<TsModule> {
  tsPromise ??= import('typescript').then((m) => ((m as unknown as { default?: TsModule }).default ?? (m as unknown as TsModule)));
  return tsPromise;
}

function loadLibs(): Promise<Map<string, string>> {
  libsPromise ??= (async () => {
    const entries = Object.entries(libLoaders).filter(([path]) => NEEDED_LIB.test(path));
    const map = new Map<string, string>();
    await Promise.all(entries.map(async ([path, load]) => map.set(path.slice(path.lastIndexOf('/') + 1), await load())));
    return map;
  })();
  return libsPromise;
}

/** Ambient declarations available in every problem (ES libs have no console). */
const GLOBALS = `declare const console: {
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
declare function setTimeout(handler: () => void, ms?: number): number;
declare function clearTimeout(id: number): void;
`;

/**
 * Learner code runs as a plain script, so module syntax is removed. Lines are blanked rather
 * than deleted so error line numbers still match the editor.
 */
export function stripModuleSyntax(code: string): string {
  return code
    .replace(/^[ \t]*import\s[^\n]*?from\s+['"][^'"]+['"];?[ \t]*$/gm, '')
    .replace(/^[ \t]*import\s+['"][^'"]+['"];?[ \t]*$/gm, '')
    .replace(/^([ \t]*)export\s+default\s+(?=(async\s+)?(function|class)\b)/gm, '$1')
    .replace(/^([ \t]*)export\s+(?=(declare\s+)?(async\s+)?(function|const|let|var|class|interface|type|enum)\b)/gm, '$1')
    .replace(/^[ \t]*export\s*\{[^}]*\};?[ \t]*$/gm, '');
}

export interface TypeCheckResult {
  results: TestResult[];
}

export async function typeCheck(userCode: string, typeTests: TypeTest[]): Promise<TypeCheckResult> {
  const [ts, libs] = await Promise.all([loadTs(), loadLibs()]);

  const files = new Map<string, string>();
  files.set('/user.ts', userCode);
  files.set('/globals.d.ts', GLOBALS);
  typeTests.forEach((t, i) => files.set(`/typetest${i}.ts`, `{\n${t.code}\n}\n`));

  const options: TS.CompilerOptions = {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2020,
    lib: ['lib.es2020.d.ts'],
    types: [],
    skipLibCheck: true,
    moduleDetection: ts.ModuleDetectionKind.Legacy,
  };

  const libName = (fileName: string) => fileName.replace(/^\//, '');
  const host: TS.CompilerHost = {
    getSourceFile: (fileName, languageVersion) => {
      const own = files.get(fileName);
      if (own !== undefined) return ts.createSourceFile(fileName, own, languageVersion, true);
      const name = libName(fileName);
      const lib = libs.get(name);
      if (lib === undefined) return undefined;
      let sf = libSourceCache.get(name);
      if (!sf) {
        sf = ts.createSourceFile(fileName, lib, languageVersion, true);
        libSourceCache.set(name, sf);
      }
      return sf;
    },
    getDefaultLibFileName: () => '/lib.es2020.d.ts',
    getDefaultLibLocation: () => '/',
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    fileExists: (f) => files.has(f) || libs.has(libName(f)),
    readFile: (f) => files.get(f) ?? libs.get(libName(f)),
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };

  const program = ts.createProgram({ rootNames: [...files.keys()], options, host });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const byFile = new Map<string, TS.Diagnostic[]>();
  for (const d of diagnostics) {
    const key = d.file?.fileName ?? '(global)';
    byFile.set(key, [...(byFile.get(key) ?? []), d]);
  }

  const describe = (d: TS.Diagnostic) => {
    const text = ts.flattenDiagnosticMessageText(d.messageText, ' ');
    if (!d.file || d.start === undefined) return text;
    const { line } = d.file.getLineAndCharacterOfPosition(d.start);
    return `Line ${line + 1}: ${text}`;
  };

  const results: TestResult[] = [];
  const userDiags = [...(byFile.get('/user.ts') ?? []), ...(byFile.get('(global)') ?? [])];
  results.push(
    userDiags.length === 0
      ? { name: 'Your code type-checks in strict mode', passed: true }
      : {
          name: 'Your code type-checks in strict mode',
          passed: false,
          message: userDiags.slice(0, 5).map(describe).join('\n') + (userDiags.length > 5 ? `\n…and ${userDiags.length - 5} more` : ''),
        },
  );

  typeTests.forEach((t, i) => {
    const diags = byFile.get(`/typetest${i}.ts`) ?? [];
    if (diags.length === 0) return results.push({ name: t.name, passed: true });
    const d = diags[0] as TS.Diagnostic;
    const lineText = (() => {
      if (!d.file || d.start === undefined) return '';
      const { line } = d.file.getLineAndCharacterOfPosition(d.start);
      return d.file.text.split('\n')[line]?.trim() ?? '';
    })();
    const message =
      d.code === 2578
        ? `${t.hint ?? 'Your types accept something they should reject.'}`
        : `Type error in the test${lineText ? ` (\`${lineText}\`)` : ''}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`;
    results.push({ name: t.name, passed: false, message });
  });

  return { results };
}

export interface TranspileResult {
  code: string;
  errors: string[];
}

export async function transpile(code: string, jsx: boolean): Promise<TranspileResult> {
  const ts = await loadTs();
  const out = ts.transpileModule(code, {
    fileName: jsx ? 'user.tsx' : 'user.ts',
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      moduleDetection: ts.ModuleDetectionKind.Legacy,
    },
  });
  const errors = (out.diagnostics ?? []).map((d) => {
    const text = ts.flattenDiagnosticMessageText(d.messageText, ' ');
    if (!d.file || d.start === undefined) return text;
    return `Line ${d.file.getLineAndCharacterOfPosition(d.start).line + 1}: ${text}`;
  });
  return { code: out.outputText.replace(/^export\s*\{\s*\};?\s*$/gm, ''), errors };
}
