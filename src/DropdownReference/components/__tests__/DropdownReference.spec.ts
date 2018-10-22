import { shallow } from "enzyme";
import { createElement } from "react";

import Select from "react-select";
import { Label } from "../../../SharedResources/components/Label";
import { DropdownReference, DropdownReferenceProps } from "../DropdownReference";
import { Alert } from "../../../SharedResources/components/Alert";

describe("DropdownReference", () => {
    const render = (props: DropdownReferenceProps) => shallow(createElement(DropdownReference, props));
    const ReferenceProps: DropdownReferenceProps = {
        emptyOptionCaption: "Select city",
        labelWidth: 3,
        data: [ { value: "KampalaId" , label: "kampala" }, { value: "AmsterdamId" , label: "Amsterdam" } ],
        value: "Kampala",
        labelCaption: "City",
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
        const DropdownReferenceComponent = render(ReferenceProps);

        expect(DropdownReferenceComponent).toBeElement(
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
        const DropdownReferenceComponent = render(ReferenceProps);

        DropdownReferenceComponent.setProps({ labelCaption: "", showLabel: false });
        expect(DropdownReferenceComponent).toBeElement(
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

    it("that is still loading renders with the structure", () => {
        const DropdownReferenceComponent = render(ReferenceProps);

        DropdownReferenceComponent.setProps({ loaded: true });
        expect(DropdownReferenceComponent).toBeElement(createElement("div", {}));
    });

    describe("with readOnlyStyle as 'text'", () => {
        it("renders with the structure with a selected value", () => {
            const DropdownReferenceComponent = render(ReferenceProps);
            DropdownReferenceComponent.setProps({ readOnlyStyle: "text" });

            expect(DropdownReferenceComponent).toBeElement(
                createElement(Label, { label: "City" , orientation: "horizontal" , weight: 3 },
                    createElement("p", { className: "form-control-static" }, "kampalaId"))
            );
        });

        it("renders with the structure with a no value", () => {
            const DropdownReferenceComponent = render(ReferenceProps);
            DropdownReferenceComponent.setProps({ readOnlyStyle: "text", selectedValue: null });

            expect(DropdownReferenceComponent).toBeElement(
                createElement(Label, { label: "City" , orientation: "horizontal" , weight: 3 },
                    createElement("p", { className: "form-control-static" }, ""))
            );
        });
    });
});
