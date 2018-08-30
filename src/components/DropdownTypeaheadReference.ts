import { Component, createElement } from "react";
// import { createPortal } from "react-dom";
import Select , { Async } from "react-select";

import { Alert } from "./Alert";
import { parseStyle } from "../utils/ContainerUtils";
import { Label } from "./Label";
// import { Menu } from "./Menu";
import * as classNames from "classnames";
import "../ui/DropdownTypeaheadReference.scss";
import "react-select/dist/react-select.css";

export interface DropdownTypeaheadReferenceProps {
    style?: string;
    labelWidth: number;
    data: ReferenceOption[];
    asyncData: any;
    value: string;
    label: string;
    showLabel: boolean;
    emptyCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectType: "normal" | "asynchronous";
    selectedValue: ReferenceOption;
    handleOnchange: (selectedOption: ReferenceOption) => void;
    className: string;
    readOnlyStyle: "control" | "text";
    labelOrientation: "horizontal" | "vertical";
    alertMessage: string;
}

export type ReferenceOption = {
    value?: string,
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
        if (this.props.readOnlyStyle === "control") {
                return createElement("div", {
                    className: classNames("widget-dropdown-type-ahead-wrapper")
                },
                this.props.selectType === "normal" ?
                    createElement(Select, {
                        clearable: this.props.isClearable,
                        // menuRenderer: (params: any) => createPortal(Menu(params), ContainerNode as any) as any,
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
