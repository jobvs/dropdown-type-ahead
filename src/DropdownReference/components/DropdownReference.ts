import { Component, createElement } from "react";
import Select , { Async } from "react-select";
import * as classNames from "classnames";

import { Alert } from "../../SharedResources/components/Alert";
import { Label } from "../../SharedResources/components/Label";

import "react-select/dist/react-select.css";
import "../../SharedResources/ui/Dropdown.scss";

export interface DropdownTypeaheadProps {
    styleObject?: object;
    labelWidth: number;
    data?: ReferenceOption[];
    asyncData?: any;
    value?: string;
    labelCaption: string;
    loaded: boolean;
    showLabel: boolean;
    emptyOptionCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectType: "normal" | "asynchronous";
    selectedValue: ReferenceOption | null;
    handleOnchange?: (selectedOption: ReferenceOption | any) => void;
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
            if (this.props.showLabel && this.props.labelCaption) {
                return createElement(Label, {
                    className: this.props.className,
                    label: this.props.labelCaption,
                    orientation: this.props.labelOrientation,
                    style: this.props.styleObject,
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
                    createElement(Select, {
                        options: this.props.data,
                        noResultsText: "No options",
                        ...commonProps }) :
                    createElement(Async, {
                            valueKey : "value",
                            labelKey : "label",
                            autoFocus: true,
                            autoload: false,
                            loadOptions: (input: string) => this.props.asyncData(input),
                            ...commonProps }),
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

        return { value: null , placeholder: this.props.emptyOptionCaption };
    }
}
