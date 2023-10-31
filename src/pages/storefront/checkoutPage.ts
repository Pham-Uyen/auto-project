import { APIRequestContext, FrameLocator, Locator, Page, expect } from "@playwright/test";
import type { Card, ShippingAddress } from "../../types/pages/checkoutPage";
import { SBPage } from "../../thirtparty/page";
export class SFCheckout extends SBPage {

  emailLoc: Locator;
  firstnameLoc: Locator;
  lastnameLoc: Locator;
  addLoc: Locator;
  apartmentLoc: Locator;
  cityLoc: Locator;
  provinceLoc: Locator;
  zipLoc: Locator;
  countryLoc: Locator;
  phoneLoc: Locator;
  checkoutToken: string;
  request: APIRequestContext;
  itemPostPurchaseValue: string;
    constructor(page: Page, domain: string, checkoutToken?: string, request?: APIRequestContext) {
      super(page, domain)
      this.checkoutToken = checkoutToken!;
      this.request = this.request;
      this.emailLoc = this.genLoc("#checkout_shipping_address_email");
      this.firstnameLoc = this.genLoc("#checkout_shipping_address_first_name");
      this.lastnameLoc = this.genLoc("#checkout_shipping_address_last_name");
      this.addLoc = this.genLoc("#checkout_shipping_address_address_line1");
      this.cityLoc = this.genLoc("#checkout_shipping_address_city");
      this.zipLoc = this.genLoc("#checkout_shipping_address_zip");
      this.countryLoc = this.genLoc("#checkout_shipping_address_country_name");
      this.provinceLoc = this.genLoc("#checkout_shipping_address_province");
      this.phoneLoc = this.genLoc("#checkout_shipping_address_phone");
      this.itemPostPurchaseValue = "0";
    }
    defaultCardInfo: Card = {
        number: "4242424242424242",
        expire_date: "11/23",
        cvv: "100",
        failMessage: ""
      };

      xpathPhoneNumberInShippingMethod = "//input[@id='checkout_shipping_address_shipping_phone']";
      xpathPaymentMethodLabel = `//span[@class='layout-flex__item section__title--emphasis' and text()='Payment' or text()='Payment method']`;
      xpathFooterSF = "//div[@class='main__footer' or @class='checkout-footer--wb']";
      xpathPaymentMethodStripe = "//input[contains(@value,'credit-card')]/following-sibling::span[@class='s-check']";
      xpathThankYou = "//*[normalize-space()='Thank you!']";
      footerLoc = this.page.locator(this.xpathFooterSF);
      xpathSearching = "//p[contains(@class, 'searching')]";


      async enterShippingAddress(shippingAddress: ShippingAddress) {
        for (const [key, value] of Object.entries(shippingAddress)) {
          switch (key) {
            case "email":
              await this.inputEmail(value);
              break;
            case "first_name":
              await this.inputFirstName(value);
              break;
            case "last_name":
              await this.inputLastName(value);
              break;
            case "address":
              await this.inputAddress(value);
              break;
            // case "country":
            //   await this.selectCountry(value);
            //   break;
            // case "state":
            //   await this.selectStateOrProvince(value);
            //   break;
            case "city":
              await this.inputCity(value, "shipping", 2);
              break;
            // case "zipcode":
            //   await this.inputZipcode(value);
            //   break;
            case "phone_number":
              await this.inputPhoneNumber(value);
              break;
            // case "company":
            //   await this.inputCustomerInfo("company-name", value);
            //   break;
            // case "social_id":
            //   await this.inputCustomerInfo("social-id", value);
            //   break;
          }
        }
        // await this.clickBtnContinueToShippingMethod();
      }

      async inputEmail(email: string, form = "shipping") {
        await this.inputCustomerInfo("email-address", email, form);
      }

      async inputFirstName(firstName: string, form = "shipping") {
        await this.inputCustomerInfo("first-name", firstName, form);
      }
    
      async inputLastName(lastName: string, form = "shipping") {
        await this.inputCustomerInfo("last-name", lastName, form);
      }

      async inputAddress(address: string, form = "shipping") {
        await this.inputCustomerInfo("street-address", address, form);
        if (form == "shipping") {
          await this.page.click(`//input[@name='email-address' and contains(@id,'shipping')]`);
        }
      }
    
      async inputCity(city: string, form = "shipping", index: number) {
        await this.inputCustomerInfo("city", city, form, index);
      }
    
      async inputZipcode(zipcode: string, form = "shipping", autoFill?: boolean) {
        await this.inputCustomerInfo("zip-code", zipcode, form);
        if (autoFill) {
          await this.page.click(`//a[@class='s-dropdown-item' and contains(normalize-space(), '${zipcode}')]`);
        }
      }

      async inputPhoneNumber(phoneNumber: string, form = "shipping") {
        await this.inputCustomerInfo("phone-number", phoneNumber, form);
      }
    
      /**
       * Input phone number required in block shipping method
       * @param phoneNumber
       */
      async inputPhoneNumberInShippingMethod(phoneNumber: string) {
        await this.page.locator(this.xpathPhoneNumberInShippingMethod).fill(phoneNumber);
      }

      async selectCountry(country: string, form = "shipping") {
        const xpathCountryField =
          `(//div[contains(@class,'relative s-select-searchable') and` +
          ` descendant::input[@name='countries' and contains(@id,'${form}')]])[1]`;
        await this.page.locator(xpathCountryField).click();
        await this.inputData(".s-select-searchable.s-select-searchable--active input[placeholder='Search']", country);
        await this.page.click(xpathCountryField + `//span[normalize-space()='${country}']`);
      }

      async selectStateOrProvince(state: string, form = "shipping") {
        if (state) {
          await this.page.locator(`//input[@name="provinces" and contains(@autocomplete,'${form}')]`).click();
          await this.inputData(".s-select-searchable.s-select-searchable--active input[placeholder='Search']", state);
          await this.page.click(`(//span[normalize-space()='${state}'])[1]`);
        }
      }

        /**
   * input customer information for each field
   * @param className
   * @param value value to input
   * @param form for "shipping" | "billing" form, default for "shipping" form
   */
  async inputCustomerInfo(className: string, value, form = "shipping", index = 1) {
    await this.page.locator(`(//input[@name='${className}' and contains(@id,'${form}')])[${index}]`).click();
    await this.page.locator(`(//input[@name='${className}' and contains(@id,'${form}')])[${index}]`).fill(value);
    await this.page.locator(`(//input[@name='${className}' and contains(@id,'${form}')])[${index}]`).evaluate(e => e.blur());
  }

  async clickBtnContinueToShippingMethod() {
    const coutinueBtn = "text=Continue to shipping method";
      // await this.navigationWith(() => this.page.locator(coutinueBtn).click());
      await this.page.locator(coutinueBtn).click({ delay: 2000 });
  }

  async continueToPaymentMethod() {
    // const nextStep = this.page.locator("text=Continue to payment method");
    //   await nextStep.click();
    //   await this.page.waitForSelector(this.xpathPaymentMethodLabel);
    await this.footerLoc.scrollIntoViewIfNeeded();
  }

  async completeOrderWithCreditCard(card: Card) {
    //Select payment method
    // await this.page.locator(this.xpathPaymentMethodStripe).first().scrollIntoViewIfNeeded();
    // await this.page.locator(this.xpathPaymentMethodStripe).check();    

    // Input card data
    await this.enterCardNumber(card.number);
    await this.enterExpireDate(card.expire_date);
    await this.enterCVV(card.cvv);
    await this.clickBtnCompleteOrder();
  }

  async verifyThankyouPage() {
    const isThankyouPage = await this.isElementExisted(this.xpathThankYou, null, 10000);
    return isThankyouPage;
  }

  async verifyFailMessage(failMessage: string) {
    await this.page.waitForSelector(`//p[text()='${failMessage}']`);
  }

    /**
   * Input card number: required switch to iframes if iframes exist
   * @param cardNumber
   */
    async enterCardNumber(cardNumber: string): Promise<void> {
      // const mainFrame = await this.switchToStripeIframe();
      // const secondIframeXpath = "//div[@id='stripe-card-number' or @id='creditCardNumber']//iframe";
      // const validate = await this.isElementExisted(secondIframeXpath, mainFrame);
      // if (validate) {
      //   await mainFrame.frameLocator(secondIframeXpath).locator('[placeholder="Card number"]').fill(cardNumber);
      // } else {
      //   await mainFrame.locator('[placeholder="Card number"]').fill(cardNumber);
      // }
      const iframeStripe = this.page.frameLocator("//iframe[contains(@class,'payment-frame-form') or contains(@id,'stripe-frame-form')]");
      const secondIframeXpath = "//div[@id='stripe-card-number' or @id='creditCardNumber']//iframe";
      await iframeStripe.frameLocator(secondIframeXpath).locator("//div[@class='CardNumberField-input-wrapper']//input[@name='cardnumber']").fill(cardNumber);
    }

      /** payment gateway Stripe
   * switch to main iframe when checkout via stripe or spay
   */
async switchToStripeIframe(timeout = 3000): Promise<Page | FrameLocator> {
  await this.page.waitForLoadState("domcontentloaded");
  const iframeStripe = "//iframe[contains(@class,'payment-frame-form') or contains(@id,'stripe-frame-form')]";
  if (await this.isElementExisted(iframeStripe, null, timeout)) {
    return this.page.frameLocator(iframeStripe);
  }
  return this.page;
}

  /**
   * Input card expire date: required switch to iframes if iframes exist
   * @param expireDate
   */
  async enterExpireDate(expireDate: string): Promise<void> {
    const iframeStripe = this.page.frameLocator("//iframe[contains(@class,'payment-frame-form') or contains(@id,'stripe-frame-form')]");
    const secondIframeXpath = "//iframe[@title='Secure expiration date input frame']";
    await iframeStripe.frameLocator(secondIframeXpath).locator("//span[@class='InputContainer']//input[@name='exp-date']").fill(expireDate);
  }

    /**
   * Input card cvv: required switch to iframes if iframes exist
   * @param cvv
   */
    async enterCVV(cvv: string): Promise<void> {
      const iframeStripe = this.page.frameLocator("//iframe[contains(@class,'payment-frame-form') or contains(@id,'stripe-frame-form')]");
      const secondIframeXpath = "//iframe[@title='Secure CVC input frame']";
      await iframeStripe.frameLocator(secondIframeXpath).locator("//span[@class='InputContainer']//input[@name='cvc']").fill(cvv);
    }

    async clickBtnCompleteOrder() {
      // await this.clickAgreedTermsOfServices();
      await this.clickCompleteOrder();
    }

      /**
   * Click agreed term of services before complete order
   */
  async clickAgreedTermsOfServices() {
    const agreedTermsOfServices =
      "//div[normalize-space()='I have read and agreed to the'] | //label[@id='accept-tos']/span[contains(@class,'s-check')]";
    if (await this.page.locator(agreedTermsOfServices).isVisible()) {
      await this.page.click(agreedTermsOfServices);
    }
  }

  async clickCompleteOrder() {
    await this.page.locator("//span[text()='Place your order']").hover();
      await this.page.locator("//span[text()='Place your order']").click();
  }

  async openHomepage() {
      await this.page.goto(this.domain);
      await this.page.waitForLoadState("networkidle");
  }

  async searchThenViewProduct(productName: string, productOption?: string) {
    let searchLoc = this.genLoc(`input[placeholder='Search']`);
    if (!(await searchLoc.isVisible())) {
      searchLoc = this.genLoc("//input[@placeholder='Enter keywords...']");
      await this.goto("/search");
    }
    await this.page.waitForLoadState("networkidle"); //vi khi dang fill textbox page bi reload lai nen textbox bi trong => doi trang on dinh load het
    await searchLoc.click();
    await searchLoc.fill(productName);
    await searchLoc.press("Enter");
    await this.page.waitForLoadState("networkidle");
    await expect(this.genLoc(this.xpathSearching)).toBeHidden();

    // Wait for css transition complete
    await this.page.waitForTimeout(2 * 1000);

    await this.page.locator(`(//span[text()="${productName}"]//ancestor::a)[1]`).click();
  }

  async addProductToCart() {
    await this.page.locator("(//button[normalize-space()='Add to cart'])[1]").click();
  }

  async navigateToCheckoutPage() {
    await this.page.locator(`//button[normalize-space()='Checkout']`).click();
    await this.page.waitForTimeout(5000)
    await expect(this.page.locator("//span[@class='layout-flex__item section__title--emphasis' and text()='Shipping address']")).toBeVisible();
  }
}

