import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testMatch: ["tests/checkout/checkout_stripe.spec.ts"],
  timeout: 150000,
  use:{
    headless: true,
    // screenshot: "on",
    ignoreHTTPSErrors: true,
    trace: "on"
  },
  reporter: [["dot"], ["html", {
    outputFile: "htmlReports/htmlReport.html"
  }]]
}
console.log(JSON.stringify(process.env));

export default config;