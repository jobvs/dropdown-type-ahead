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

    componentDidMount() {
        const scrollContainer = document.querySelector(".region-content .mx-scrollcontainer-wrapper");
        if (scrollContainer) {
            const dropdown = document.getElementsByClassName("Select-menu-outer");
            scrollContainer.addEventListener("scroll", () => {
                // document.querySelectorAll(".Select.is-focused")[0]
                // ? document.querySelectorAll(".Select.is-focused")[0].classList.remove("Select", "is-open", "is-focused")
                // : window.logger.warn("Dropdown not available");
                dropdown[0] ? (dropdown[0] as HTMLElement).style.visibility = "hidden" : window.logger.warn("Dropdown not available");
                const activeElement = document.activeElement;
                if (activeElement) {
                    (activeElement as any).blur();
                }
            });
        }
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
                className: classNames("widget-dropdown-reference-set"),
                onClick: this.setDropdownSize
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

    private setDropdownSize = () => {
        const dropdown = document.getElementsByClassName("Select-menu-outer");
        if ((dropdown[0] as HTMLElement).style.visibility !== "visible") {
            const dropdownDimensions = dropdown[0].getBoundingClientRect();
            if (dropdown && dropdown.length && dropdownDimensions) {
                (dropdown[0] as HTMLElement).style.width = dropdownDimensions.width - .08 + "px";
                (dropdown[0] as HTMLElement).style.left = dropdownDimensions.left + "px";
                (dropdown[0] as HTMLElement).style.top = dropdownDimensions.top + "px";
                (dropdown[0] as HTMLElement).style.visibility = "visible";
                (dropdown[0] as HTMLElement).style.position = "fixed";
            }
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
