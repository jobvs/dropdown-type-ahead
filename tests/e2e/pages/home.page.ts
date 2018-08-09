class HomePage {
    public get dropDownSelector() {
        return browser.element(".mx-name-dropdownTypeaheadReference10 .widget-dropdown-type-ahead__value-container");
    }
    public get clearIndicator() {
        return browser.element(".mx-name-dropdownTypeaheadReference10 .widget-dropdown-type-ahead__clear-indicator svg");
    }

    public get dropDownOptions() {
        return browser.elements(".widget-dropdown-type-ahead__option");
    }

    public open(): void {
        browser.url("/p/home");
    }
}

const homePage = new HomePage();
export default homePage;
