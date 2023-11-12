import { test } from "@playwright/test";
import { CheckoutAPI } from "../../src/pages/api/checkoutPage";
import { Card } from "../../src/types/pages/checkoutPage";

test.describe("Checkout via Credit card",() => {
    let chechoutAPI: CheckoutAPI
    const domain = "checkout-stripe.onshopbase.com";
    const product = [
        {
            "variant_id": 1000011089437115,
            "quantity": 1
        }
    ];
    let card: Card = {
        number: "4242 4242 4242 4242",
        expire_date: "09/24",
        cvv: "100",
        failMessage: ""
    }
    const countryCode = "US"

    test("Checkout thành công qua cổng Stripe", async ({ request }) => {
        chechoutAPI = new CheckoutAPI(domain, request);
        await chechoutAPI.addProductToCartThenCheckout(product);
        await chechoutAPI.updateCustomerInformation();
        await chechoutAPI.selectDefaultShippingMethod(countryCode);
        await chechoutAPI.authorizedThenCreateStripeOrder(card)
    })
}) 