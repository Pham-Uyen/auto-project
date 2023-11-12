import { Page, APIRequestContext } from "playwright";
import { BuyerInfoApi, Product } from "../../types/pages/checkoutApi";
import { expect } from "@playwright/test";
import { Card, ShippingMethod } from "../../types/pages/checkoutPage";

export class CheckoutAPI {
    page: Page;
    domain: string;
    request: APIRequestContext;
    cartToken: string;
    checkoutToken: string;
    shippingMethod = {};
    publicKey: "pk_test_51H0MEvDrQ1c0YGaqU7dp7ga3qSBBF8WDJvKq8LVc2kHC9dAYWLhtRoM79nHUGrOAe2xtCkteyKf95OUi6mvVMrjF003BPKJocn";
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
    await this.getCheckoutInfo();
  }

    /**
   *
   * @returns checkout information on checkout page
   */
    async getCheckoutInfo() {
      let res;
      // retry get checkout info
      for (let i = 0; i < 3; i++) {
        res = await this.request.get(`https://${this.domain}/api/checkout/${this.checkoutToken}/info.json`);
        if (res.ok()) {
          break;
        }
      }
      if (!res.ok()) {
        return Promise.reject(`Error message: ${(await res.json()).error} ${new Error().stack}`);
      }
      const resBody = await res.json();
      return resBody.result;
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
          buyer_accepts_marketing: true
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

  /**
   *
   * @param card
   */
  async authorizedThenCreateStripeOrder(card: Card) {
    await this.createStripePaymentMethod(card);
    await this.authorizedOrder();
  }

    /**
   * Creates a PaymentMethod object for Stripe gateway
   * Stripe docs: https://stripe.com/docs/api/payment_methods/create
   */
    async createStripePaymentMethod(card: Card) {
      const expMonth = card.expire_date.split("/")[0].trim();
      const expYear = card.expire_date.split("/")[1].trim();
  
      let formData;
      formData = {
        type: "card",
        "card[number]": card.number,
        "card[cvc]": card.cvv,
        "card[exp_month]": "12",
        "card[exp_year]": "25",
        "key": "pk_test_51H0MEvDrQ1c0YGaqU7dp7ga3qSBBF8WDJvKq8LVc2kHC9dAYWLhtRoM79nHUGrOAe2xtCkteyKf95OUi6mvVMrjF003BPKJocn",
      };
      const res = await this.request.post(`https://api.stripe.com/v1/payment_methods`, {
        form: formData,
      });
      expect(res.status()).toBe(200);
      const resBody = await res.json();
      this.stripePaymentMethodId = await resBody.id;
      console.log("stripe id", this.stripePaymentMethodId);
    }

      /**
   * The API create an order with payment status = `Authorized`
   */
  async authorizedOrder() {
    let bodyData;
    debugger;
    bodyData = {
      payment_method: "stripe",
      provider_payload: {
        token: "tok_visa",
        payment_method_id: this.stripePaymentMethodId,
      },
    };
    const res = await this.request.post(
      `https://${this.domain}/api/checkout/${this.checkoutToken}/charge-authorize.json`,
      {
        data: bodyData,
      },
    );
    if (!res.ok()) {
      return Promise.reject(
        `Error message: ${(await res.json()).error} \n bodyData = ${bodyData} \n${new Error().stack}`,
      );
    }
    const resBody = await res.json();
    console.log("resbody", resBody);
  }

   /**
   * get order info on dashboard
   */
   async getOrderInfo(request: APIRequestContext) {
    await this.getOrderId();
    const res = await request.get(`https://${this.domain}/admin/orders/${this.orderId}.json`);
    expect(res.status()).toBe(200);
    const resBody = await res.json();
    return {
      id: resBody.order.id,
      subtotal: resBody.order.subtotal_price,
      total: resBody.order.total_price,
      shipping_fee: resBody.order.shipping_lines[0].price,
      discount: resBody.order.total_discounts,
      financial_status: resBody.order.financial_status,
      name: resBody.order.name,
    };
  }

  async getOrderId() {
    const res = await this.request.get(`https://${this.domain}/api/checkout/${this.checkoutToken}/info.json`);
    expect(res.status()).toBe(200);
    const resBody = await res.json();
    return (this.orderId = await resBody.result.order.id);
  }
}