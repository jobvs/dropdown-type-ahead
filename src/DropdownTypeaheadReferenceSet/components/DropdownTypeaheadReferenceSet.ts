import { Component, createElement } from "react";
import Select , { Async } from "react-select";
import * as classNames from "classnames";

import { Alert } from "./Alert";
import { Label } from "./Label";

import "../ui/DropdownTypeaheadReferenceSet.scss";
import "react-select/dist/react-select.css";

export interface DropdownTypeaheadProps {
    style?: object;
    labelWidth: number;
    data?: ReferenceOption[];
    asyncData?: any;
    value: string;
    label: string;
    loaded: boolean;
    showLabel: boolean;
    emptyCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectType: "normal" | "asynchronous";
    selectedValue: any;
    handleOnchange: (selectedOption: ReferenceOption | any) => void;
    className?: string;
    readOnlyStyle: "control" | "text";
    labelOrientation: "horizontal" | "vertical";
    alertMessage: string;
}

export interface ReferenceOption {
    value?: string | boolean;
    label?: string;
}

export interface AttributeType {
    name: string;
    sort: string;
}

export class DropdownTypeahead extends Component<DropdownTypeaheadProps> {
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
        const commonProps: object = {
            clearable: this.props.isClearable,
            multi: true,
            removeSelected: true,
            disabled: this.props.isReadOnly,
            onChange: this.props.handleOnchange,
            clearValueText: "",
            ...this.createSelectorProp() as object
        };

        if (this.props.readOnlyStyle === "control") {
                return createElement("div", {
                    className: classNames("widget-dropdown-type-ahead-wrapper")
                },
                this.props.selectType === "normal" ?
                    this.props.isReadOnly ?
                    createElement("input", {
                        type: "text",
                        readonly: "readonly",
                        className: "form-control",
                        disabled: "disabled",
                        value: this.processOptions() }) :
                    createElement(Select, {
                        options: this.props.data,
                        noResultsText: "No options",
                        ...commonProps }) :
                    createElement(Async, {
                            valueKey : "value",
                            labelKey : "label",
                            autoload: false,
                            loadOptions: (input: string) => this.props.asyncData(input),
                            ...commonProps }),
                    createElement(Alert, {
                        className: "widget-dropdown-type-ahead-alert"
                    }, this.props.alertMessage)
                );
        } else {
            return createElement("p", { className: "form-control-static" },
                this.processOptions());
        }

    }

    private createSelectorProp(): { placeholder?: string, value?: ReferenceOption | null } {
        if (this.props.selectedValue.length > 0) {
            return { value: this.props.selectedValue };
        }

        return { value: null , placeholder: this.props.emptyCaption };
    }

    private processOptions() {
        let selectedLabel = "";
        let formatedOptions = [];

        if (this.props.selectedValue.length > 0) {
            formatedOptions = this.props.selectedValue.map((selectedGuid: string) => {
                if (this.props.data) {
                    this.props.data.forEach((dataObject: any) => {
                        const value = dataObject.value;
                        if (value === selectedGuid) {
                            selectedLabel = dataObject.label;
                        }
                    });
                }

                return selectedLabel !== "" ? selectedLabel : undefined;
            });
        }

        return formatedOptions.join(", ");
    }
}
