import { Component, createElement } from "react";
import Select from "react-select";

import { Alert } from "./Alert";
import { parseStyle } from "../utils/ContainerUtils";
import { Label } from "./Label";
import * as classNames from "classnames";
import "../ui/DropdownTypeaheadReference.scss";
import { Control } from "./Control";
// import { IndicatorsContainer } from "./IndicatorsContainer";
// import { Dropdown } from "./DropdownIndicator";
import { Menu } from "./Menu";
// import { DropdownClear } from "./DropdownClear";

export interface DropdownTypeaheadReferenceProps {
    style?: string;
    labelWidth: number;
    data: ReferenceOption[];
    value: string;
    label: string;
    showLabel: boolean;
    emptyCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectedValue: ReferenceOption;
    loaded: boolean;
    handleOnchange: (selectedOption: ReferenceOption) => void;
    className: string;
    labelOrientation: "horizontal" | "vertical";
    alertMessage: string;
}

// tslint:disable-next-line:interface-over-type-literal
export type ReferenceOption = { value?: string, label?: string };

// tslint:disable-next-line:interface-over-type-literal
export type MetaData = { action: string, removedValue: ReferenceOption };

export interface AttributeType { name: string; sort: string; }

export class DropdownTypeaheadReference extends Component<DropdownTypeaheadReferenceProps> {
    render() {
        return !this.props.loaded ? createElement("div", {
                className: classNames("widget-dropdown-type-ahead-wrapper", this.props.className)
            },
            this.renderForm()) :
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

    private renderSelector() {
        return createElement("div", {},
            createElement(Select as any, {
            className: classNames("react-select-container", this.props.isReadOnly ? "disabled" : "enabled"),
            components: { Control, Menu },
            isClearable: this.props.isClearable,
            isDisabled: this.props.isReadOnly,
            isSearchable: true,
            menuPlacement: "bottom",
            menuPosition: "fixed",
            onChange: this.props.handleOnchange,
            options: this.props.data,
            ...this.createSelectorProp()
        }),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.props.alertMessage));
    }

    private createSelectorProp(): { placeholder?: string, value?: ReferenceOption | null } {
        if (this.props.selectedValue !== "") {
            return { value: this.props.selectedValue };
        }
        return { value: null , placeholder: this.props.emptyCaption };
    }
}
