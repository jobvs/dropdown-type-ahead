import { Component, createElement } from "react";

import { parseStyle, validateProps } from "./utils/ContainerUtils";
import { DropdownTypeaheadReference } from "./components/DropdownTypeaheadReference";
import { ContainerProps } from "./components/DropdownTypeaheadReferenceContainer";

declare function require(name: string): string;

type VisibilityMap = {
    [P in keyof ContainerProps]: boolean;
};

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, {}> {
    render() {
        const selectedValue = {
            label: this.props.emptyOptionCaption,
            value: "noGuid"
        };

        return createElement(DropdownTypeaheadReference as any, {
            alertMessage: validateProps(this.props),
            attribute: this.props.attribute,
            className: this.props.class,
            emptyCaption: this.props.emptyOptionCaption,
            isClearable: this.props.isClearable,
            isReadOnly: this.isReadOnly(),
            label: this.props.labelCaption,
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            readOnlyStyle: this.props.readOnlyStyle,
            selectedValue,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    private isReadOnly = (): boolean => {
        return (this.props.editable !== "default") || this.props.readOnly;
    }
}

export function getPreviewCss() {
    return require("./ui/DropdownTypeaheadReference.scss");
}

export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: VisibilityMap) {
    visibilityMap.microflow = valueMap.source === "microflow";
    visibilityMap.nanoflow = valueMap.source === "nanoflow";
    visibilityMap.entityPath = valueMap.source === "xpath";
    visibilityMap.onChangeMicroflow = valueMap.onChangeEvent === "callMicroflow";
    visibilityMap.onChangeNanoflow = valueMap.onChangeEvent === "callNanoflow";

    if (valueMap.source !== "xpath") {
        visibilityMap.sortAttributes = false;
        visibilityMap.sortOrder = false;
        visibilityMap.entityConstraint = false;
    }

    return visibilityMap;
}
