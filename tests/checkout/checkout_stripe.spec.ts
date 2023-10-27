import { test } from "@playwright/test";
import { SFCheckout } from "../../src/pages/storefront/checkoutPage";
import { Card } from "../../src/types/pages/checkoutPage";

test.describe("Checkout via Credit card",() => {
    let checkoutPage: SFCheckout;
    const domain = "https://test-cod.myshopbase.net";
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
    let cartInvalid: Card = {
        number: "4242 4242 4242 4242",
        expire_date: "09/24",
        cvv: "100"
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
        await checkoutPage.completeOrderWithCreditCard(cartInvalid);
        //test build job jenkins
        //test checkout job jenkins

    })
}) 