import homePage from "./pages/home.page";

const defaultOption = "Select users";

xdescribe("Dropdown reference set ", () => {

    it("should populate multiple values in a dropdown list", () => {
        homePage.open();
        homePage.dropDownReferenceSet.waitForExist();

        homePage.dropDownReferenceSet.click();
        homePage.dropDownOptions.waitForExist();

        browser.waitUntil(() => {
            const dropDownOptions: WebdriverIO.Element[] = homePage.dropDownOptions.value;

            return dropDownOptions.length > 1;
        }, 5000, "expected more 1 option to be populated");
    });

    it("should select multi options from the drop-down menu", () => {
        homePage.open();
        homePage.dropDownReferenceSet.waitForExist();
        homePage.clearSetIndicator.click();
        expect(homePage.selectSetPlaceholder).toBe(defaultOption);

        homePage.dropDownReferenceSet.click();
        homePage.dropDownOptions.waitForExist();
        browser.keys("ArrowDown");
        browser.keys("ArrowDown");
        browser.keys("ArrowDown");
        browser.keys("Enter");

        homePage.dropDownReferenceSet.click();
        homePage.dropDownOptions.waitForExist();
        browser.keys("ArrowDown");
        browser.keys("ArrowDown");
        browser.keys("Enter");

        homePage.dropDownReferenceSet.waitForValue();
        expect(homePage.selectedSetElement.getHTML()).toContain(homePage.selectedSetValue);
    });

    it("should clear the selected options", () => {
        homePage.open();
        homePage.dropDownReferenceSet.waitForExist();

        expect(homePage.selectedSetElement.getHTML()).toContain(homePage.selectedSetValue);

        homePage.clearSetIndicator.click();
        homePage.dropDownReferenceSet.waitForValue();

        expect(homePage.selectSetPlaceholder).toBe(defaultOption);
    });
});
