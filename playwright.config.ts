import type { PlaywrightTestConfig } from '@playwright/test';


const proxy = `http://${process.env.OCG_PROXY_URL}`

const config: PlaywrightTestConfig = {
  testDir: "tests",
  timeout: 150000,
  use:{
    launchOptions: {
      // Browser proxy option is required for Chromium on Windows.
      proxy: { server: proxy }
    },
    headless: true,
    // screenshot: "on",
    ignoreHTTPSErrors: true,
    proxy:{
      server: proxy,
    },
    trace: "on",
  },
  reporter: [["dot"], ["html", {
    outputFile: "htmlReports/htmlReport.html"
  }]]
}
console.log(JSON.stringify(process.env));

export default config;