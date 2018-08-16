import { Component, createElement } from "react";

import { parseStyle } from "./utils/ContainerUtils";
import { DropdownTypeaheadReference } from "./components/DropdownTypeaheadReference";
import { ContainerProps } from "./components/DropdownTypeaheadReferenceContainer";

declare function require(name: string): string;

type VisibilityMap = {
    [P in keyof ContainerProps]: boolean;
};

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, {}> {
    private selected = {
        label: this.props.emptyOptionCaption,
        value: "noGuid"
    };

    render() {
        return createElement(DropdownTypeaheadReference as any, {
            emptyCaption: this.selected.label,
            isClearable: this.props.isClearable,
            isReadOnly: this.isReadOnly(),
            label: this.props.labelCaption,
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
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
        visibilityMap.sortOrder = false;
        visibilityMap.entityConstraint = false;
    }

    return visibilityMap;
}
