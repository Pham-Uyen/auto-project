import { expect, Locator, Page, Response } from "@playwright/test";
import { SBPage } from "../../thirtparty/page";
import type { ConfigStore } from "@types";

export class AccountPage extends SBPage {
  emailLoc: Locator;
  pwdLoc: Locator;
  storeNameLoc: Locator;
  signInLoc: Locator;
  xpathTextFreeTrialSignUpPage = "//div[@class='unite-ui-login__title']/h1";
  xpathTitleAddYourContactPage = "//section[@class='survey']//h1";
  xpathBtnStartFreeTrialLandingPage = "//div[@class='div-block-235']/a | //div[@class='div-block-3']/a";
  xpathTextSelectAShop = "//p[contains(@class,'text-select-shop')]";
  xpathTitleSignInPage = "//div[@class='unite-ui-login__main']//p[text()='Sign in']";
  xpathShopDomain = "(//p[@class='text-truncate font-12'])[1]";
  xpathCreateStoreSuccess = "//p[normalize-space()='Yay! Your store is ready to go!']";
  xpathNotify = "//header[contains(@class,'shopbase-sidebar')]//div[@class='in-app-notification']";

  constructor(page: Page, domain: string) {
    super(page, domain);
    this.emailLoc = this.page.locator("[placeholder='example@email.com']");
    this.pwdLoc = this.page.locator("[placeholder='Password']");
    this.signInLoc = this.page.locator("button:has-text('Sign in')");
  }

  /**
   * Login to dashboard
   */
  async login({
    email = "",
    password = "",
    redirectToAdmin = true,
  }: {
    email?: string;
    password?: string;
    redirectToAdmin?: boolean;
  }) {
    if (redirectToAdmin) {
      try {
        await this.goToAdmin();
      } catch (e) {
        // Retry again if page is blank or can't load
        await this.goToAdmin();
      }
    }
    await this.emailLoc.fill(email);
    await this.pwdLoc.fill(password);
    await Promise.all([this.page.waitForNavigation(), this.signInLoc.click()]);
    await this.page.waitForLoadState("load");
  }

  async goToAdmin() {
    await this.page.goto(`https://${this.domain}/admin`, {
      timeout: 30 * 1000,
    });
  }

  async inputAccountAndSignIn({ email = "", password = "" }: { email?: string; password?: string }) {
    await this.emailLoc.fill(email);
    await this.pwdLoc.fill(password);
    await Promise.all([this.page.waitForNavigation(), this.signInLoc.click()]);
    await this.page.waitForLoadState("load");
  }

  async inputAccountAndSignInNoWait({ email = "", password = "" }: { email?: string; password?: string }) {
    await this.emailLoc.fill(email);
    await this.pwdLoc.fill(password);
    await this.signInLoc.click();
  }

  async gotoAdmin() {
    await this.page.goto(`https://${this.domain}/admin`);
  }

  /**
   * Navigate to menu in dashboard
   * @param menu:  menu name
   * */
  async navigateToMenu(menu: string, index = 1): Promise<void> {
    const menuXpath = `(${this.getXpathMenu(menu)})[${index}]`;
    await this.page.locator(menuXpath).click();
    await this.page.waitForTimeout(2000);
  }

  getXpathMenu(menuName: string): string {
    const xpath =
      `//ul[contains(@class,'menu') or contains(@class,'active treeview-menu') or contains(@class,'nav-sidebar')]` +
      `//li` +
      `//*[text()[normalize-space()='${menuName}']]` +
      `//ancestor::a` +
      `|(//span[following-sibling::*[normalize-space()='${menuName}']]//ancestor::a)`;
    return xpath;
  }
}
