import { test } from "@playwright/test";
import { CheckoutAPI } from "../../src/pages/api/checkoutPage";
import { Card } from "../../src/types/pages/checkoutPage";
import { AccountPage } from "../../src/pages/dashboard/accountPage";

test.describe("Checkout via Credit card",() => {
    let chechoutAPI: CheckoutAPI;
    let accountPage: AccountPage;
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
    const countryCode = "US";
    const email = "shopbase1@beeketing.net";
    const password = "=7#d2L9b3SuuA*%Q";

    test.beforeEach(async ({ request }) => {
        chechoutAPI = new CheckoutAPI(domain, request);
        await chechoutAPI.addProductToCartThenCheckout(product);
        await chechoutAPI.updateCustomerInformation();
        await chechoutAPI.selectDefaultShippingMethod(countryCode);
        await chechoutAPI.authorizedThenCreateStripeOrder(card)
        let checkoutInfo = await chechoutAPI.getCheckoutInfo();
        debugger;
    })

    test("Kiểm tra order details", async ({ page }) => {
        accountPage = new AccountPage(page, domain);
        await test.step("Login vào Dashboard", async () => {
            await accountPage.login({
                email: email,
                password: password
            });
        })

        await test.step("Di chuyển tới trang order và truy cập vào order details", async () => {
            await accountPage.navigateToMenu("Orders");
            await accountPage.goToOrderDetails();
        })
        
    })
}) 