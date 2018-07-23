import { Component, createElement } from "react";

import { parseStyle } from "./utils/ContainerUtils";
import { DropdownTypeaheadReference } from "./components/DropdownTypeaheadReference";
import { DropdownTypeaheadReferenceContainerProps } from "./components/DropdownTypeaheadReferenceContainer";

declare function require(name: string): string;

type VisibilityMap = {
    [P in keyof DropdownTypeaheadReferenceContainerProps]: boolean;
};

// tslint:disable-next-line class-name
export class preview extends Component<DropdownTypeaheadReferenceContainerProps, {}> {
    private selected = {
        label: this.props.emptyOptionCaption,
        value: "noGuid"
    };

    render() {
        return createElement(DropdownTypeaheadReference as any, {
            attribute: this.props.attribute,
            // data: this.state.options,
            label: this.props.labelCaption,
            selectedValue: this.selected.label,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }
}

export function getPreviewCss() {
    return require("./ui/DropdownTypeaheadReference.scss");
}

export function getVisibleProperties(valueMap: DropdownTypeaheadReferenceContainerProps, visibilityMap: VisibilityMap) {
    visibilityMap.source = valueMap.microflow === "microflow";

    return visibilityMap;
}
