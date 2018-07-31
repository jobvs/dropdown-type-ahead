import { Component, createElement } from "react";
import Select from "react-select";

import { Alert } from "./Alert";
import * as classNames from "classnames";
import "../ui/DropdownTypeaheadReference.scss";

export interface DropdownTypeaheadReferenceProps {
    style?: object;
    data: referenceOption[];
    value: string;
    label: string;
    showLabel: boolean;
    emptyCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectedValue: referenceOption;
    handleOnchange: (selectedOption: referenceOption) => void;
    className: string;
    alertMessage: string;
}

// tslint:disable-next-line:interface-over-type-literal
export type referenceOption = { value?: string, label?: string };

export class DropdownTypeaheadReference extends Component<DropdownTypeaheadReferenceProps> {
    render() {
        return createElement("div", {
            className: classNames("widget-dropdowntypeahead-wrapper", this.props.className)
        },
            this.renderLabel(),
            this.renderSelector()
        );
    }

    private renderLabel() {
        if (this.props.showLabel) {
            return createElement("div", { className: "div-wrapper-label" },
                createElement("label", { className: "mx-control-label" },
                    this.props.label));
        }

        return;
    }

    private renderSelector() {
        return createElement("div", {
            className: classNames(
                "div-wrapper",
                this.props.isReadOnly ? "disabled" : "enabled",
                this.props.showLabel ? "showlabel" : "nolabel"
            )},
            createElement(Select as any, {
                isClearable: this.props.isClearable,
                isDisabled: this.props.isReadOnly,
                isSearchable: true,
                onChange: this.props.handleOnchange,
                options: this.props.data,
                ...this.createSelectProp()
            }),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.props.alertMessage)
        );
    }

    private createSelectProp(): { placeholder?: string, value?: referenceOption } {
        if (this.props.selectedValue === undefined) {
            return { placeholder: this.props.emptyCaption };
        } else if (JSON.stringify(this.props.selectedValue) !== "{}" && this.props.selectedValue.label !== "") {
            return { value: this.props.selectedValue };
        } else {
            return { placeholder: this.props.emptyCaption };
        }
    }
}
