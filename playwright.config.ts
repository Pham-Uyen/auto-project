import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testMatch: ["tests/checkout/checkout_stripe.spec.ts"],
  use:{
    headless: false,
    screenshot: "on",


  },
  reporter: [["dot"], ["html", {
    outputFile: "htmlReports/htmlReport.html"
  }]]
}
console.log(JSON.stringify(process.env));

export default config;