import { Page, APIRequestContext } from "playwright";
import { BuyerInfoApi, Product } from "../../types/pages/checkoutApi";
import { expect } from "@playwright/test";
import { ShippingMethod } from "../../types/pages/checkoutPage";

export class CheckoutAPI {
    page: Page;
    domain: string;
    request: APIRequestContext;
    cartToken: string;
    checkoutToken: string;
    shippingMethod = {};
    publicKey: string;
    gatewayCode: string;
    stripePaymentMethodId: number;
    checkoutPaymentMethodId: number;
    connectedAccount: string;
    spayToken: string;
    orderId: number;
    orderName: string;
    totalTax = 0;
    totalTaxShipping = 0;

    constructor(domain: string, request?: APIRequestContext, page?: Page, checkoutToken?: string) {
        this.page = page!;
        this.domain = domain;
        this.request = request!;
        this.checkoutToken = checkoutToken!;
    }

    defaultCustomerInfo = {
        emailBuyer: `tester${Math.floor(Date.now() / 1000)}@mailtothis.com`,
        shippingAddress: {
          address1: "10800 W Pico Blvd Suite 312",
          address2: "OCG",
          city: "Los Angeles",
          company: "OCG",
          country_code: "US",
          first_name: "Tester",
          last_name: Date.now().toString(),
          phone: "2064646354",
          province: "California",
          province_code: "CA",
          zip: "90401",
        },
      } as BuyerInfoApi;
    defaultCardInfo = {
        number: "4111111111111111",
        holder_name: "Shopbase",
        expire_date: "12 / 24",
        cvv: "100",
    };

    /**
   * Allow to add multiple products to cart by call the update cart API multiple times
   * Step:
   * 1. Create an empty cart
   * 2. Add product to cart
   * 3. Fetch checkout info
   */
  async addProductToCartThenCheckout(products: Array<Product>) {
    await this.createCart();

    for (const product of products) {
      const res = await this.request.put(`https://${this.domain}/api/checkout/next/cart.json`, {
        data: {
          cartItem: {
            variant_id: product.variant_id,
            qty: product.quantity,
            properties: [],
          },
          from: "add-to-cart",
        },
        params: { cart_token: this.cartToken },
      });
      if (!res.ok()) {
        return Promise.reject(
          `Error when add Product ${product.variant_id} to cart.
          Error message: ${(await res.json()).error} ${new Error().stack}`,
        );
      }
    }
  }

   /**
   * creat an empty cart to generate new cart token, checkout token
   */
   async createCart() {
    const res = await this.request.post(`https://${this.domain}/api/checkout/next/cart.json`);
    if (!res.ok()) {
      return Promise.reject(`Error message: ${(await res.json()).error} ${new Error().stack}`);
    }
    const resBody = await res.json();

    this.cartToken = resBody.result.token;
    this.checkoutToken = resBody.result.checkout_token;

    return {
      token: this.cartToken,
      checkout_token: this.checkoutToken,
    };
  }

   /**
   * update customer information for the checkout
   * @param email
   * @param shippingAddress
   * @returns
   */
   async updateCustomerInformation(
    email = this.defaultCustomerInfo.emailBuyer,
    shippingAddress = this.defaultCustomerInfo.shippingAddress,
  ) {
    const res = await this.request.put(
      `https://${this.domain}/api/checkout/${this.checkoutToken}/customer-and-shipping.json`,
      {
        data: {
          email: email,
          shipping_address: shippingAddress,
        },
      },
    );
    if (!res.ok()) {
      return Promise.reject(`Error message: ${(await res.json()).error} ${new Error().stack}`);
    }
    const resBody = await res.json();
    return resBody.result;
  }

    /**
   * select default shipping method
   * @param countryCode
   */
    async selectDefaultShippingMethod(countryCode: string) {
        await this.getShippingMethodInfo(countryCode);
    
        const res = await this.request.put(
          `https://${this.domain}/api/checkout/${this.checkoutToken}/shipping-methods.json?country_code=${countryCode}`,
          {
            data: {
              shipping_method: this.shippingMethod,
            },
          },
        );
        expect(res.status()).toBe(200);
      }

       /**
   * return all available shipping methods, then pick the first shipping method to set default
   */
  async getShippingMethodInfo(countryCode?: string): Promise<Array<ShippingMethod>> {
    if (!countryCode) {
      countryCode = null!;
    }
    const res = await this.request.get(
      `https://${this.domain}/api/checkout/${this.checkoutToken}/shipping-methods.json?country_code=${countryCode}`,
    );
    if (!res.ok()) {
      return Promise.reject(`Error message: ${(await res.json()).error} ${new Error().stack}`);
    }
    const resBody = await res.json();
    if (resBody.result?.length) {
      // pick the first shipping method to set default
      this.shippingMethod = {
        method_code: resBody.result[0].method_code,
        shipping_rule_id: resBody.result[0].shipping_rule_id,
        shipping_rule_type: resBody.result[0].shipping_rule_type,
        shipping_group_code: resBody.result[0].method_code,
        shipping_include_insurance: false,
      };
    }
    return resBody.result;
  }
}