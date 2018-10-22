import { Component, createElement } from "react";

import { parseStyle, validateProps } from "../SharedResources/utils/ContainerUtils";
import { DropdownReference } from "./components/DropdownReference";
import { ContainerProps } from "./components/DropdownReferenceContainer";

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

        return createElement(DropdownReference, {
            alertMessage: validateProps(this.props),
            className: this.props.class,
            emptyOptionCaption: this.props.emptyOptionCaption,
            isClearable: this.props.isClearable,
            selectType: this.props.selectType,
            isReadOnly: this.isReadOnly(),
            data: [ selectedValue ],
            asyncData: (input: string) => this.setAsyncSampleData(input),
            labelCaption: this.props.labelCaption ? this.props.labelCaption.trim() : "",
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            readOnlyStyle: this.props.readOnlyStyle,
            selectedValue,
            showLabel: this.props.showLabel,
            styleObject: parseStyle(this.props.style),
            loaded: false
        });
    }

    private isReadOnly(): boolean {
        return (this.props.editable !== "default") || this.props.readOnly;
    }

    private setAsyncSampleData(input: string): Promise<{}> | undefined {
        if (!input) {
            return Promise.resolve({ options: [ ] });
        }

        return;
    }
}

export function getPreviewCss() {
    return (
       require("react-select/dist/react-select.css") + require("../SharedResources/ui/Dropdown.scss")
    );
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

    if (valueMap.selectType !== "asynchronous") {
        visibilityMap.searchAttribute = false;
    }

    return visibilityMap;
}
