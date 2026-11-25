import type { CodeTest, TestResult } from '../../types/checkpoint';

export interface JsRequest {
  kind: 'js';
  mode: 'plain' | 'react' | 'rn';
  code: string;
  exports: string[];
  setup: string;
  tests: CodeTest[];
}

export interface SqlRequest {
  kind: 'sql';
  setup: string;
  user: string;
  reference: string;
  tests: CodeTest[];
  ordered: boolean;
}

export type WorkerRequest = JsRequest | SqlRequest;

export interface WorkerResponse {
  results: TestResult[];
  logs: string[];
  error?: string;
  table?: { columns: string[]; rows: unknown[][] };
}
