import { Component, createElement } from "react";
import Select from "react-select";

import { Alert } from "./Alert";
import { parseStyle } from "../utils/ContainerUtils";
import { Label } from "./Label";
import * as classNames from "classnames";
import "../ui/DropdownTypeaheadReference.scss";

export interface DropdownTypeaheadReferenceProps {
    style?: string;
    labelWidth: number;
    data: referenceOption[];
    value: string;
    label: string;
    showLabel: boolean;
    emptyCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectedValue: referenceOption;
    loaded: boolean;
    handleOnchange: (selectedOption: referenceOption) => void;
    className: string;
    labelOrientation: "horizontal" | "vertical";
    alertMessage: string;
}

// tslint:disable-next-line:interface-over-type-literal
export type referenceOption = { value?: string, label?: string };

// tslint:disable-next-line:interface-over-type-literal
export type metaData = { action: string, removedValue: referenceOption };

export interface AttributeType { name: string; sort: string; }

export class DropdownTypeaheadReference extends Component<DropdownTypeaheadReferenceProps> {
    // private Node?: HTMLDivElement;

    render() {
        return !this.props.loaded ? createElement("div", {
                className: classNames("widget-dropdown-type-ahead-wrapper", this.props.className)
            },
                this.renderForm()
            ) :
            null;
    }

    private renderForm() {
        if (this.props.showLabel && this.props.label.trim() !== "") {
            return createElement(Label, {
                className: this.props.className,
                label: this.props.label,
                orientation: this.props.labelOrientation,
                style: parseStyle(this.props.style),
                weight: this.props.labelWidth
            }, this.renderSelector());
        }

        return this.renderSelector();
    }

    // private setReference = (Node: HTMLDivElement) => {
    //     this.Node = Node;
    // }

    private renderSelector() {
        return createElement("div", {
            className: classNames(
                // "form-group"
            //     "div-wrapper",
            //     this.props.isReadOnly ? "disabled" : "enabled",
            //     this.props.showLabel ? "showlabel" : "nolabel"
            )},
            createElement(Select as any, {
                classNamePrefix: "widget-dropdown-type-ahead",
                isClearable: this.props.isClearable,
                isDisabled: this.props.isReadOnly,
                isSearchable: true,
                menuPlacement: "bottom",
                menuPosition: "fixed",
                onChange: this.props.handleOnchange,
                options: this.props.data,
                // ref: this.setReference,
                ...this.createSelectorProp()
            }),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.props.alertMessage)
        );
    }

    private createSelectorProp(): { placeholder?: string, value?: referenceOption } {
        if (this.props.selectedValue) {
            return { value: this.props.selectedValue };
        }
        return { placeholder: this.props.emptyCaption };
    }
}
