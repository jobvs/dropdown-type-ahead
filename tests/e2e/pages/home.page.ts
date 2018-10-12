class HomePage {
    public get dropDownSelector() {
        return browser.element(".mx-name-dropdownTypeaheadReference13 .Select-control");
    }

    public get dropDownReferenceSet() {
        return browser.element(".mx-name-dropdownTypeaheadReferenceSet2 .Select-control");
    }

    public get selectedValue() {
        return browser.getText("#react-select-2--value-item");
    }

    public get selectedSetValue() {
        return browser.getText("#react-select-3--value-0").trim();
    }

    public get selectPlaceholder() {
        return browser.getText(".mx-name-dropdownTypeaheadReference13 .Select-control .Select-placeholder");
    }

    public get selectSetPlaceholder() {
        return browser.getText(".mx-name-dropdownTypeaheadReferenceSet2 .Select-control .Select-placeholder");
    }

    public get selectedElement() {
        return browser.element(".mx-name-dropdownTypeaheadReference13 .Select-control .Select-value-label");
    }

    public get selectedSetElement() {
        return browser.element(".mx-name-dropdownTypeaheadReferenceSet2 .Select-control .Select-value-label");
    }

    public get clearIndicator() {
        return browser.element(".mx-name-dropdownTypeaheadReference13 .Select-clear-zone .Select-clear");
    }

    public get clearSetIndicator() {
        return browser.element(".mx-name-dropdownTypeaheadReferenceSet2 .Select-clear-zone .Select-clear");
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
