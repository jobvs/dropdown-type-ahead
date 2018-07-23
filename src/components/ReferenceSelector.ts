import { Component, createElement } from "react";
import Select from "react-select";

import "../ui/ReferenceSelector.scss";

export interface ReferenceSelectorProps {
    style?: object;
    readOnly: boolean;
    data: any;
    value: string;
    label: string;
    showLabel: "yes" | "no";
    selectedValue: referenceOption;
    handleOnchange: (selectedOption: any) => void;
    handleClick: () => void;
}

// tslint:disable-next-line:interface-over-type-literal
export type referenceOption = { guid?: string, label?: string };

export class ReferenceSelector extends Component<ReferenceSelectorProps> {
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
            createElement(Select, {
                onChange: this.props.handleOnchange,
                options: this.props.data,
                value: this.props.selectedValue
            })
        );
    }
}
