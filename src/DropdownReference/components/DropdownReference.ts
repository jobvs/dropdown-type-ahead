import { Component, createElement } from "react";
import * as classNames from "classnames";
import Select, { Async, LoadOptionsHandler } from "react-select";

import { Alert } from "../../SharedResources/components/Alert";
import { Label } from "../../SharedResources/components/Label";

import "react-select/dist/react-select.css";
import "../../SharedResources/ui/Dropdown.scss";

export interface DropdownReferenceProps {
    styleObject?: object;
    labelWidth: number;
    data: ReferenceOption[];
    asyncData: LoadOptionsHandler<{}>;
    value?: string;
    labelCaption: string;
    showLabel: boolean;
    emptyOptionCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectedValue: ReferenceOption;
    className?: string;
    alertMessage: string;
    searchText: string;
    loadingText: string;
    minimumCharacter: number;
    labelOrientation: "horizontal" | "vertical";
    readOnlyStyle: "control" | "text";
    selectType: "normal" | "asynchronous";
    handleOnchange?: (selectedOption: any) => void;
}

export interface ReferenceOption {
    value?: string | boolean;
    label?: string;
}

export class DropdownReference extends Component<DropdownReferenceProps> {

    render() {
        return this.props.showLabel
            ? createElement(Label, {
                className: this.props.className,
                label: this.props.labelCaption,
                orientation: this.props.labelOrientation,
                style: this.props.styleObject,
                weight: this.props.labelWidth
            }, this.renderSelector())
            : this.renderSelector();
    }

    private renderSelector() {
        const commonProps = {
            clearable: this.props.isClearable,
            disabled: this.props.isReadOnly,
            onChange: this.props.handleOnchange,
            ...this.createSelectorProp()
        };

        if (this.props.readOnlyStyle === "control" || (this.props.readOnlyStyle === "text" && !this.props.isReadOnly)) {
            return createElement("div", {
                className: "widget-dropdown-reference"
            },
                this.props.selectType === "normal"
                    ? createElement(Select, {
                        options: this.props.data,
                        ...commonProps
                    })
                    : createElement(Async, {
                        searchPromptText: this.props.minimumCharacter > 0
                            ? `Type more than ${this.props.minimumCharacter} characters to search`
                            : "Type to search",
                        loadOptions: this.props.asyncData,
                        ...commonProps
                    }),
                createElement(Alert, { className: "widget-dropdown-reference-alert" }, this.props.alertMessage)
            );
        } else {
            return createElement("p", { className: classNames("form-control-static", "read-only-text") },
                this.props.selectedValue ? this.props.selectedValue.label : "");
        }
    }

    private createSelectorProp(): { placeholder?: string, value?: object } {
        if (this.props.selectedValue) {
            return { value: this.props.selectedValue };
        }

        return { placeholder: this.props.emptyOptionCaption };
    }
}
