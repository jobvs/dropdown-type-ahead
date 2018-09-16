import { Component, createElement } from "react";

import { parseStyle, validateProps } from "./utils/ContainerUtils";
import { DropdownTypeahead } from "./components/DropdownTypeahead";
import { ContainerProps } from "./components/DropdownTypeaheadContainer";

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

        return createElement(DropdownTypeahead as any, {
            alertMessage: validateProps(this.props),
            attribute: this.props.attribute,
            className: this.props.class,
            emptyCaption: this.props.emptyOptionCaption,
            isClearable: this.props.isClearable,
            selectType: this.props.selectType,
            isReadOnly: this.isReadOnly(),
            data: [ selectedValue ],
            asyncData: (input: string) => this.setAsyncSampleData(input),
            label: this.props.labelCaption,
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            readOnlyStyle: this.props.readOnlyStyle,
            selectedValue,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
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
        require("./ui/DropdownTypeahead.scss") + require("react-select/dist/react-select.css")
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

    return visibilityMap;
}
