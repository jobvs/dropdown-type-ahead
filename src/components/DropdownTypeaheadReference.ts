import { Component, createElement } from "react";
import Select from "react-select";

import "../ui/DropdownTypeaheadReference.scss";

export interface DropdownTypeaheadReferenceProps {
    style?: object;
    readOnly: boolean;
    data: referenceOption[];
    value: string;
    label: string;
    showLabel: boolean;
    emptyCaption: string;
    isReadOnly: boolean;
    selectedValue: referenceOption;
    handleOnchange: (selectedOption: referenceOption) => void;
    handleClick: () => void;
}

// tslint:disable-next-line:interface-over-type-literal
export type referenceOption = { guid?: string, label?: string };

export class DropdownTypeaheadReference extends Component<DropdownTypeaheadReferenceProps> {
    render() {
        return createElement("div", { className: "widget-reference-selector-wrapper" },
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
        return createElement("div", { className: "div-wrapper" },
            createElement(Select as any, {
                isDisabled: this.props.isReadOnly,
                onChange: this.props.handleOnchange,
                options: this.props.data,
                placeholder: this.props.emptyCaption,
                value: this.props.selectedValue
            })
        );
    }
}
