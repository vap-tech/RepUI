import { defineConfig, devices } from "@playwright/test";

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
    command: ".venv/bin/python manage.py runserver 127.0.0.1:8000",
    url: "http://127.0.0.1:8000/docs/",
    reuseExistingServer: !process.env.CI,
  },
});
