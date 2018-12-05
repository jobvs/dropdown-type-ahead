import { Component, createElement } from "react";
import * as classNames from "classnames";
import Select, { Async } from "react-select";

import { Alert } from "../../SharedResources/components/Alert";
import { Label } from "../../SharedResources/components/Label";
import { DropdownReferenceProps } from "../../SharedResources/utils/ContainerUtils";

import "react-select/dist/react-select.css";
import "../../SharedResources/ui/Dropdown.scss";

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

    componentDidMount() {
        const scrollContainer = document.querySelector(".region-content .mx-scrollcontainer-wrapper");
        if (scrollContainer && this.props.location === "popup") {
            (document.getElementsByClassName("widget-dropdown-reference")[0] as HTMLElement).style.overflow = "hidden";
            const dropdown = document.getElementsByClassName("Select-menu-outer");
            scrollContainer.addEventListener("scroll", () => {
                dropdown[0] ? (dropdown[0] as HTMLElement).style.visibility = "hidden" : window.logger.warn("Dropdown not available");
                const activeElement = document.activeElement;
                if (activeElement) {
                    (activeElement as HTMLElement).blur();
                }
            });
        }
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
                className: "widget-dropdown-reference",
                onClick: this.setDropdownSize
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

    private setDropdownSize = () => {
        const dropdown = document.getElementsByClassName("Select-menu-outer");
        const dropdownElement = dropdown[0] as HTMLElement;
        if (dropdownElement && dropdownElement.style.visibility !== "visible" && this.props.location === "popup") {
            dropdownElement.style.visibility = "hidden";
            const dropdownDimensions = dropdown[0].getBoundingClientRect();
            if (dropdownDimensions) {
                dropdownElement.style.width = dropdownDimensions.width - .08 + "px";
                dropdownElement.style.left = dropdownDimensions.left + "px";
                dropdownElement.style.top = dropdownDimensions.top + "px";
                dropdownElement.style.visibility = "visible";
                dropdownElement.style.position = "fixed";
            }
        }
    }

    private createSelectorProp(): { placeholder?: string, value?: object } {
        if (this.props.selectedValue && this.props.selectedValue.value) {
            return { value: this.props.selectedValue };
        }

        return { placeholder: this.props.emptyOptionCaption };
    }
}
