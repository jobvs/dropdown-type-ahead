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
    loaded: boolean;
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

interface DropdownReferenceSetState {
    showOptions: boolean;
    selectedData: {}[];
}

export class DropdownReferenceSet extends Component<DropdownReferenceSetProps> {
    readonly state: DropdownReferenceSetState = {
        showOptions: false,
        selectedData: []
    };

    render() {
        return this.props.loaded ?
            this.props.showLabel ?
                createElement(Label, {
                    className: this.props.className,
                    label: this.props.labelCaption,
                    orientation: this.props.labelOrientation,
                    style: this.props.styleObject,
                    weight: this.props.labelWidth
                }, this.renderSelector()) :
                this.renderSelector() :
            createElement("div", { className: "loading-data" });
    }

    private renderSelector() {
        const commonProps: object = {
            clearable: this.props.isClearable,
            multi: true,
            removeSelected: true,
            disabled: this.props.isReadOnly,
            onChange: this.props.handleOnchange,
            searchPromptText: this.props.searchText,
            onInputChange: (input: string) => this.onInputChange(input),
            clearValueText: "",
            ...this.createSelectorProp() as object
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
                            options: this.state.showOptions ? this.props.data : this.state.selectedData,
                            noResultsText: "",
                            ...commonProps
                        }) :
                    createElement(Async, {
                        valueKey: "value",
                        labelKey: "label",
                        autoload: false,
                        autoFocus: true,
                        loadingPlaceholder: this.props.loadingText,
                        loadOptions: (input: string) => this.props.asyncData(input),
                        ...commonProps
                    }),
                createElement(Alert, {
                    className: "widget-dropdown-reference-set-alert"
                }, this.props.alertMessage)
            );
        } else {
            return createElement("p", { className: classNames("form-control-static", "read-only-text") },
                this.processOptions());
        }

    }

    private createSelectorProp(): { placeholder?: string, value?: ReferenceOption | null } {
        if (this.props.selectedValue.length > 0) {
            return { value: this.props.selectedValue };
        }

        return { value: null, placeholder: this.props.emptyOptionCaption };
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

                return selectedLabel || undefined;
            });
        }

        return formatedOptions.join(", ");
    }

    private onInputChange = (newValue: string) => {
        let showOptions = false;
        if (newValue.length >= this.props.minimumCharacter) {
            showOptions = true;
        }

        this.setState({ showOptions, selectedData: this.props.selectedValue });
    }
}
