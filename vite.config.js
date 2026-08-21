import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Note: test configuration lives in vitest.config.js, not here — having it
// in both files previously caused a silent conflict (this file declared
// `environment: 'node'` for unit tests while vitest.config.js declared
// `jsdom`; only the latter was ever actually used, which made the former
// misleading dead config). `npm run test` / `npx vitest run` picks up
// vitest.config.js automatically.
export default defineConfig({
  plugins: [react()],
});
