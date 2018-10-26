import { Component, createElement } from "react";
import Select , { Async } from "react-select";
import * as classNames from "classnames";

import { Alert } from "../../SharedResources/components/Alert";
import { Label } from "../../SharedResources/components/Label";

import "react-select/dist/react-select.css";
import "../../SharedResources/ui/Dropdown.scss";

export interface DropdownReferenceProps {
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
    searchText: string;
    loadingText: string;
    minimumCharacter: number;
}

export interface ReferenceOption {
    value?: string | boolean;
    label?: string;
}

interface DropdownReferenceState {
    showOptions: boolean;
}

export class DropdownReference extends Component<DropdownReferenceProps, DropdownReferenceState> {
    readonly state: DropdownReferenceState = {
        showOptions: false
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
            disabled: this.props.isReadOnly,
            onChange: this.props.handleOnchange,
            onInputChange: (input: string) => this.onInputChange(input),
            clearValueText: "",
            ...this.createSelectorProp() as object
        };

        if (this.props.readOnlyStyle === "control" || (this.props.readOnlyStyle === "text" && !this.props.isReadOnly)) {
                return createElement("div", {
                    className: classNames("widget-dropdown-reference")
                },
                this.props.selectType === "normal" ?
                    createElement(Select, {
                        options: this.state.showOptions ? this.props.data : [ this.props.selectedValue ? this.props.selectedValue : {} ],
                        noResultsText: "",
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
            return createElement("p", { className: classNames("form-control-static", "read-only-text") },
                this.props.selectedValue ? this.props.selectedValue.label : "");
        }
    }

    private createSelectorProp(): { placeholder?: string, value?: ReferenceOption | null } {
        if (this.props.selectedValue) {
            return { value: this.props.selectedValue };
        }

        return { value: null , placeholder: this.props.emptyOptionCaption };
    }

    private onInputChange = (newValue: string) => {
        let showOptions = false;
        if (newValue.length >= this.props.minimumCharacter) {
            showOptions = true;
        }

        this.setState({ showOptions });
    }
}
