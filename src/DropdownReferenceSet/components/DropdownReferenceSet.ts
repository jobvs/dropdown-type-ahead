import { Component, createElement } from "react";
import Select, { Async } from "react-select";
import * as classNames from "classnames";

import { Alert } from "../../SharedResources/components/Alert";
import { Label } from "../../SharedResources/components/Label";

import "react-select/dist/react-select.css";
import "../../SharedResources/ui/Dropdown.scss";

export interface DropdownReferenceSetProps {
    styleObject?: object;
    labelWidth: number;
    data?: ReferenceOption[];
    asyncData?: any;
    labelCaption: string;
    showLabel: boolean;
    emptyOptionCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectType: "normal" | "asynchronous";
    selectedValue: any;
    handleOnchange?: (selectedOption: ReferenceOption | any) => void;
    className?: string;
    readOnlyStyle: "control" | "text";
    labelOrientation: "horizontal" | "vertical";
    alertMessage: string;
    searchText: string;
    loadingText: string;
    minimumCharacter: number;
}

export interface ReferenceOption {
    value?: string | boolean;
    label?: string;
}

export class DropdownReferenceSet extends Component<DropdownReferenceSetProps> {

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
            closeOnSelect: false,
            multi: true,
            removeSelected: true,
            disabled: this.props.isReadOnly,
            onChange: this.props.handleOnchange,
            searchPromptText: this.props.searchText,
            ...this.createSelectorProp()
        };

        if (this.props.readOnlyStyle === "control" || (this.props.readOnlyStyle === "text" && !this.props.isReadOnly)) {
            return createElement("div", {
                className: classNames("widget-dropdown-reference-set")
            },
                this.props.selectType === "normal" ?
                    this.props.isReadOnly ?
                        createElement("input", {
                            type: "text",
                            readonly: "readonly",
                            className: "form-control",
                            disabled: "disabled",
                            value: this.processOptions()
                        }) :
                        createElement(Select, {
                            options: this.props.data,
                            noResultsText: "",
                            ...commonProps
                        }) :
                    createElement(Async, {
                        searchPromptText: this.props.minimumCharacter > 0
                            ? `Type more than ${this.props.minimumCharacter} characters to search`
                            : "Type to search",
                        loadOptions: this.props.asyncData,
                        ...commonProps
                    }),
                createElement(Alert, { className: "widget-dropdown-reference-set-alert" }, this.props.alertMessage)
            );
        } else {
            return createElement("p", { className: classNames("form-control-static", "read-only-text") },
                this.processOptions()
            );
        }
    }

    private createSelectorProp(): { placeholder?: string, value?: any } {
        if (this.props.selectedValue.length > 0) {
            return { value: this.props.selectedValue };
        }

        return { placeholder: this.props.emptyOptionCaption };
    }

    private processOptions() {
        let selectedLabel = "";
        let formatedOptions = [] as any;

        if (this.props.selectedValue.length > 0) {
            formatedOptions = this.props.selectedValue.map((selectedGuid: any) => {
                if (this.props.selectedValue) {
                    this.props.selectedValue.forEach((dataObject: any) => {
                        const value = dataObject.value;
                        if (value === selectedGuid.value) {
                            selectedLabel = dataObject.label;
                        }
                    });
                }

                return selectedLabel;
            });
        }

        return formatedOptions.join(", ");
    }
}
