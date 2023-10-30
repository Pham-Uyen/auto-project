import { APIRequestContext, FrameLocator, Locator, Page, test } from "@playwright/test";
export class SBPage {
page: Page;
readonly domain: string;

  constructor(page: Page, domain: string) {
    this.page = page;
    this.domain = domain;
  }

  genLoc(selector: string) {
    return this.page.locator(selector);
  }

  async inputData(locator: string, value) {
    await this.page.locator(locator).fill(value);
  }

   /**
   * Validate the existence of the element, return true or false with timeout
   * @param xpath
   * @param frameParent: in case xpath is in iframe
   * @param timeout
   */
   async isElementExisted(xpath: string, frameParent?: Page | FrameLocator | null, timeout = 3000): Promise<boolean> {
    try {
      if (frameParent) {
        try {
          await frameParent.locator(xpath).waitFor({ state: "visible", timeout: timeout });
        } catch (e) {
          return false;
        }
      } else {
        try {
          await this.page.waitForSelector(xpath, { timeout: timeout });
        } catch (e) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async goto(path: string) {

    let url = (this.domain + "/" + path).replace(/([^:]\/)\/+/g, "$1");
    if (path.startsWith("http")) {
      url = path;
    }
    await this.page.goto(url);
    await this.page.waitForLoadState("load");
  }

}