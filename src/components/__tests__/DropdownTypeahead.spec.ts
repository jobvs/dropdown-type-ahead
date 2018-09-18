import { shallow } from "enzyme";
import { createElement } from "react";

import Select from "react-select";
import { Label } from "../Label";
import { DropdownTypeahead, DropdownTypeaheadProps } from "../DropdownTypeahead";
import { Alert } from "../Alert";

describe("DropdownTypeahead", () => {
    const render = (props: DropdownTypeaheadProps) => shallow(createElement(DropdownTypeahead, props));
    const TypeAheadProps: DropdownTypeaheadProps = {
        emptyCaption: "Select city",
        labelWidth: 3,
        data: [ { value: "KampalaId" , label: "kampala" }, { value: "AmsterdamId" , label: "Amsterdam" } ],
        value: "Kampala",
        label: "City",
        loaded: false,
        showLabel: true,
        isClearable: true,
        isReadOnly: false,
        selectType: "normal",
        selectedValue: { value: "Kampala" , label: "kampalaId" } || null,
        handleOnchange: jasmine.createSpy("onClick"),
        readOnlyStyle: "control",
        labelOrientation: "horizontal",
        alertMessage: "No text"
    };

    it("renders the structure correctly", () => {
        const DropdownTypeAheadComponent = render(TypeAheadProps);

        expect(DropdownTypeAheadComponent).toBeElement(
            createElement(Label, { label: "City" , orientation: "horizontal" , weight: 3 },
                createElement("div", { className: "widget-dropdown-type-ahead-wrapper" },
                createElement(Select, {
                    clearable: true,
                    noResultsText: "No options",
                    disabled: false,
                    value: { value: "Kampala" , label: "kampalaId" },
                    onChange: jasmine.any(Function) as any,
                    clearValueText: "",
                    options: [ { value: "KampalaId" , label: "kampala" }, { value: "AmsterdamId" , label: "Amsterdam" } ]
                }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert", bootstrapStyle: "danger" }, "No text"))
            )
        );
    });

    it("with no label caption renders the structure correctly", () => {
        const DropdownTypeAheadComponent = render(TypeAheadProps);

        DropdownTypeAheadComponent.setProps({ label: "", showLabel: false });
        expect(DropdownTypeAheadComponent).toBeElement(
            createElement("div", { className: "widget-dropdown-type-ahead-wrapper" },
                createElement(Select, {
                    clearable: true,
                    noResultsText: "No options",
                    disabled: false,
                    value: { value: "Kampala" , label: "kampalaId" },
                    onChange: jasmine.any(Function) as any,
                    clearValueText: "",
                    options: [ { value: "KampalaId" , label: "kampala" }, { value: "AmsterdamId" , label: "Amsterdam" } ]
                }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert", bootstrapStyle: "danger" }, "No text"))
        );
    });

    describe("with readOnlyStyle as 'text'", () => {
        it("renders with the structure with a selected value", () => {
            const DropdownTypeAheadComponent = render(TypeAheadProps);
            DropdownTypeAheadComponent.setProps({ readOnlyStyle: "text" });

            expect(DropdownTypeAheadComponent).toBeElement(
                createElement(Label, { label: "City" , orientation: "horizontal" , weight: 3 },
                    createElement("p", { className: "form-control-static" }, "kampalaId"))
            );
        });

        it("renders with the structure with a no value", () => {
            const DropdownTypeAheadComponent = render(TypeAheadProps);
            DropdownTypeAheadComponent.setProps({ readOnlyStyle: "text", selectedValue: null });

            expect(DropdownTypeAheadComponent).toBeElement(
                createElement(Label, { label: "City" , orientation: "horizontal" , weight: 3 },
                    createElement("p", { className: "form-control-static" }, ""))
            );
        });
    });

    it("that is still loading renders with the structure", () => {
        const DropdownTypeAheadComponent = render(TypeAheadProps);

        DropdownTypeAheadComponent.setProps({ loaded: true });
        expect(DropdownTypeAheadComponent).toBeElement(createElement("div", {}));
    });
});
