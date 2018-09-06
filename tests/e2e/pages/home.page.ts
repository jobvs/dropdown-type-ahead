class HomePage {
    public get dropDownSelector() {
        return browser.element(".mx-name-dropdownTypeaheadReference13 .Select-control");
    }

    public get selectedValue() {
        return browser.getText("#react-select-2--value-item");
    }

    public get selectPlaceholder() {
        return browser.getText(".mx-name-dropdownTypeaheadReference13 .Select-control .Select-placeholder");
    }

    public get selectedElement() {
        return browser.element(".mx-name-dropdownTypeaheadReference13 .Select-control .Select-value-label");
    }

    public get clearIndicator() {
        return browser.element(".mx-name-dropdownTypeaheadReference13 .Select-clear-zone .Select-clear");
    }

    public get dropDownOptions() {
        return browser.elements(".Select-option");
    }

    public open(): void {
        browser.url("/p/home");
    }
}

const homePage = new HomePage();
export default homePage;
