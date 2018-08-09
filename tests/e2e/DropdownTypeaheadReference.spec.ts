import HomePage from "./pages/home.page";
import homePage from "./pages/home.page";

const defaultValue = "Select city";
const initialOption = "Amsterdam";

describe("Dropdown type ahead reference", () => {
    
    it("should populate multiple values in a dropdown list", () => {
        HomePage.open();
        HomePage.dropDownSelector.waitForExist();

        homePage.dropDownSelector.click();
        homePage.dropDownOptions.waitForExist();

        browser.waitUntil(() => {
            const dropDownOptions: WebdriverIO.Element[] = homePage.dropDownOptions.value;
            return dropDownOptions.length > 1;
        }, 5000, "expected more 1 option to be populated");
    });

    it("should select an option from the drop-down menu", () => {
        HomePage.open();
        HomePage.dropDownSelector.waitForExist();
        HomePage.clearIndicator.click();
        expect(HomePage.dropDownSelector.getText()).toBe("Select city");
        
        homePage.dropDownSelector.click();
        homePage.dropDownOptions.waitForExist();
        browser.keys("Enter");

        HomePage.dropDownSelector.waitForValue();
        expect(HomePage.dropDownSelector.getText()).toBe(initialOption);
    });

    it("should clear the selected option", () => {
        HomePage.open();
        HomePage.dropDownSelector.waitForExist();

        expect(HomePage.dropDownSelector.getText()).toBe(initialOption);
        HomePage.clearIndicator.click();

        homePage.dropDownSelector.waitForValue()
        expect(HomePage.dropDownSelector.getText()).toBe(defaultValue);
    });
});
