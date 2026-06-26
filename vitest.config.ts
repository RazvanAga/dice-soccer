import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Engine is a pure module with no DOM dependency.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
