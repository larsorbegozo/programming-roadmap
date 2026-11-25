import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.DEV) {
  void import('./lib/runner/validate').then(({ validateAll }) => {
    (window as unknown as { __lyraValidate: typeof validateAll }).__lyraValidate = validateAll;
  });
}
