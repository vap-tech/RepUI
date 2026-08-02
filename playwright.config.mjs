import { defineConfig, devices } from "@playwright/test";

const python = process.env.RUI_PYTHON ?? ".venv/bin/python";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `${python} manage.py runserver 127.0.0.1:8000`,
    url: "http://127.0.0.1:8000/docs/",
    reuseExistingServer: !process.env.CI,
  },
});
