import { Component, createElement } from "react";
import Select , { Async } from "react-select";
import * as classNames from "classnames";

import { Alert } from "./Alert";
import { Label } from "./Label";

import "../ui/DropdownTypeaheadReference.scss";
import "react-select/dist/react-select.css";

export interface DropdownTypeaheadReferenceProps {
    style?: object;
    labelWidth: number;
    data: ReferenceOption[];
    asyncData: any;
    value: string;
    label: string;
    loaded: boolean;
    showLabel: boolean;
    emptyCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectType: "normal" | "asynchronous";
    selectedValue: ReferenceOption;
    handleOnchange: (selectedOption: ReferenceOption | any) => void;
    className: string;
    readOnlyStyle: "control" | "text";
    labelOrientation: "horizontal" | "vertical";
    alertMessage: string;
}

export type ReferenceOption = {
    value?: string | boolean,
    label?: string
};

export type MetaData = {
    action: string,
    removedValue: ReferenceOption
};

export interface AttributeType {
    name: string;
    sort: string;
}

export class DropdownTypeaheadReference extends Component<DropdownTypeaheadReferenceProps> {
    render() {
        return this.renderForm();
    }

    private renderForm() {
        if (!this.props.loaded) {
            if (this.props.showLabel && this.props.label.trim() !== "") {
                return createElement(Label, {
                    className: this.props.className,
                    label: this.props.label,
                    orientation: this.props.labelOrientation,
                    style: this.props.style,
                    weight: this.props.labelWidth
                }, this.renderSelector());
            }

            return this.renderSelector();
        }

        return createElement("div", {});
    }

    private renderSelector() {
        // add props
        if (this.props.readOnlyStyle === "control") {
                return createElement("div", {
                    className: classNames("widget-dropdown-type-ahead-wrapper")
                },
                this.props.selectType === "normal" ?
                    createElement(Select, {
                        clearable: this.props.isClearable,
                        disabled: this.props.isReadOnly,
                        onChange: this.props.handleOnchange,
                        options: this.props.data,
                        noResultsText: "No options",
                        clearValueText: "",
                        ...this.createSelectorProp() as object }) :
                    createElement(Async, {
                            valueKey : "value",
                            labelKey : "label",
                            clearValueText: "",
                            disabled: this.props.isReadOnly,
                            clearable: this.props.isClearable,
                            onChange: this.props.handleOnchange,
                            loadOptions: (input: string) => this.props.asyncData(input),
                            ...this.createSelectorProp() as object }),
                    createElement(Alert, {
                        className: "widget-dropdown-type-ahead-alert"
                    }, this.props.alertMessage)
                );
        } else {
            return createElement("p", { className: "form-control-static" },
                this.props.selectedValue ? this.props.selectedValue.label : "");
        }

    }

    private createSelectorProp(): { placeholder?: string, value?: ReferenceOption | null } {
        if (this.props.selectedValue) {
            return { value: this.props.selectedValue };
        }

        return { value: null , placeholder: this.props.emptyCaption };
    }
}
