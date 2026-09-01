import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * Unit and component tests.
 *
 * The handoff calls a first-party test suite a mandatory improvement over the
 * Dwelve baseline, which has none. What is tested here is what breaks quietly:
 * the derivation rules (deadlines, levels, completion), the URL/filter parsing
 * that shared links depend on, error classification, and the components whose
 * accessibility contract is easy to regress.
 *
 * Playwright owns anything that needs a running server; `e2e/` is excluded
 * here so the two runners never try to run each other's files.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
