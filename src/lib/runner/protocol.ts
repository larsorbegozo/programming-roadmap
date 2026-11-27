import type { CodeTest, TestResult } from '../../types/checkpoint';

export interface JsRequest {
  kind: 'js';
  mode: 'plain' | 'react' | 'rn';
  code: string;
  /** The reference solution (already transpiled), exposed to tests as `ref`. */
  reference: string;
  exports: string[];
  setup: string;
  tests: CodeTest[];
  /** Seed for the tests' `rand` helper; a new one on every run. */
  seed: number;
}

export interface SqlRequest {
  kind: 'sql';
  setup: string;
  user: string;
  reference: string;
  tests: CodeTest[];
  ordered: boolean;
}

export type EngineRequest = JsRequest | SqlRequest;

export interface WorkerResponse {
  results: TestResult[];
  logs: string[];
  error?: string;
  table?: { columns: string[]; rows: unknown[][] };
}

/**
 * Learner code runs inside the worker and could call postMessage itself with a fake "all passed"
 * report. Only a reply carrying the secret nonce of the request counts.
 */
export interface WorkerEnvelope {
  nonce: string;
  request: EngineRequest;
}

export interface WorkerReply {
  nonce: string;
  response: WorkerResponse;
}
