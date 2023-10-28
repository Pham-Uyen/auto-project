import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testMatch: ["tests/checkout/checkout_stripe.spec.ts"],
  use:{
    headless: true,
    screenshot: "on",


  },
  reporter: [["dot"], ['json', {
    outputFile: "jsonReports/jsonReport.json"
  }], ["html", {
    open: "never"
  }]]
}

export default config;