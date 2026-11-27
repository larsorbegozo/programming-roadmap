/// <reference lib="webworker" />
/**
 * Runs learner code against tests, isolated from the page. The main thread terminates this
 * worker after a timeout, so infinite loops cannot freeze the app.
 */
import { runJs, runSql } from './engine';
import type { WorkerEnvelope, WorkerReply, WorkerResponse } from './protocol';

/** sql.js and its WebAssembly are loaded only when a SQL problem runs. */
async function loadSql() {
  const [{ default: initSqlJs }, { default: wasmUrl }] = await Promise.all([import('sql.js'), import('sql.js/dist/sql-wasm.wasm?url')]);
  return initSqlJs({ locateFile: () => wasmUrl });
}

// Captured before any learner code runs, so replacing self.postMessage cannot intercept the reply.
const post = self.postMessage.bind(self) as (reply: WorkerReply) => void;

self.onmessage = async (event: MessageEvent<WorkerEnvelope>) => {
  const { nonce, request } = event.data;
  let response: WorkerResponse;
  try {
    response = request.kind === 'sql' ? await runSql(request, loadSql) : await runJs(request);
  } catch (err) {
    response = { results: [], logs: [], error: err instanceof Error ? err.message : String(err) };
  }
  post({ nonce, response });
};
