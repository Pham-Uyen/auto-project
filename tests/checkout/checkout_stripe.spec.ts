import { expect, test } from "@playwright/test";
import { SFCheckout } from "../../src/pages/storefront/checkoutPage";
import { Card } from "../../src/types/pages/checkoutPage";

test.describe("Checkout via Credit card",() => {
    let checkoutPage: SFCheckout;
    const domain = "https://checkout-stripe.onshopbase.com/";
    const customerInfo = {
        "email": "tester@mailtothis.com",
        "first_name": "Uyen",
        "last_name": "Pham",
        "address": "1600 W Loop S",
        "country": "Belgium",
        "city": "Houston",
        "zipcode": "77027",
        "country_code": "US",
        "phone_number": "0357974381"
    }
    let cardValid: Card = {
        number: "4242 4242 4242 4242",
        expire_date: "09/24",
        cvv: "100",
        failMessage: ""
    }

    let cardExpired: Card = {
        number: "4000 0000 0000 0069",
        expire_date: "09/24",
        cvv: "100",
        failMessage: "Your card has expired."
    }

    let cardDeclined: Card = {
        number: "4000 0000 0000 0002",
        expire_date: "09/24",
        cvv: "100",
        failMessage: "The card has been declined for an unknown reason. Please contact your card issuer."
    }

    test.beforeEach(async ({ page }) => {
        checkoutPage = new SFCheckout(page, domain);
        await checkoutPage.openHomepage();
        await checkoutPage.searchThenViewProduct("Shirt");
        await checkoutPage.addProductToCart();
        await checkoutPage.navigateToCheckoutPage();
        await checkoutPage.enterShippingAddress(customerInfo);
        await checkoutPage.continueToPaymentMethod();
    })

    test("Checkout thành công qua cổng Stripe", async () => {
        await checkoutPage.completeOrderWithCreditCard(cardValid);
        expect(await checkoutPage.verifyThankyouPage()).toBeTruthy();
    })

    test("Checkout không thành công với thẻ hết hạn", async () => {
        await checkoutPage.completeOrderWithCreditCard(cardExpired);
        await checkoutPage.verifyFailMessage(cardExpired.failMessage);
    })

    test("Checkout không thành công khi giao dịch bị từ chối", async () => {
        await checkoutPage.completeOrderWithCreditCard(cardDeclined);
        await checkoutPage.verifyFailMessage(cardDeclined.failMessage);
    })
}) 