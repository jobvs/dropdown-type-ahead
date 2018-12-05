import { ContainerProps } from "../../DropdownReference/components/DropdownReferenceContainer";
import { ContainerProps as ReferenceSetProps } from "../../DropdownReferenceSet/components/DropdownReferenceSetContainer";
import { LoadOptionsHandler } from "react-select";

export interface AttributeType {
    name: string;
    sort: string;
}

export interface ReferenceOption {
    value?: string | boolean;
    label?: string;
}

export interface DropdownReferenceProps {
    styleObject?: object;
    labelWidth: number;
    data: ReferenceOption[];
    asyncData: LoadOptionsHandler<{}>;
    value?: string;
    labelCaption: string;
    showLabel: boolean;
    emptyOptionCaption: string;
    isClearable: boolean;
    isReadOnly: boolean;
    selectedValue: any;
    className?: string;
    alertMessage: string;
    searchText: string;
    loadingText: string;
    minimumCharacter: number;
    labelOrientation: "horizontal" | "vertical";
    location: "content" | "popup" | "modal" | "node";
    readOnlyStyle: "control" | "text";
    selectType: "normal" | "asynchronous";
    handleOnchange?: (selectedOption: any) => void;
}

export const parseStyle = (style = ""): { [key: string]: string } => {
    try {
        return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
            const pair = line.split(":");
            if (pair.length === 2) {
                const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                styleObject[name] = pair[1].trim();
            }

            return styleObject;
        }, {});
    } catch (error) {
        // tslint:disable-next-line no-console
        window.console.log("Failed to parse style", style, error);
    }

    return {};
};

export const validateProps = (props: ContainerProps | ReferenceSetProps): string => {
    const message: string[] = [];

    if (props.onChangeEvent === "callMicroflow" && !props.onChangeMicroflow) {
        message.push("On change event is set to 'Call a microflow' but no microflow is selected");
    } else if (props.onChangeEvent === "callNanoflow" && !props.onChangeNanoflow.nanoflow) {
        message.push("On change event is set to 'Call a nanoflow' but no nanoflow is selected");
    }

    if (props.source === "microflow" && !props.microflow) {
        message.push("Data source is set as 'microflow' but no microflow is selected");
    } else if (props.source === "nanoflow" && !props.nanoflow.nanoflow) {
        message.push("Data source is set as 'nanoflow' but no nanoflow is selected");
    }

    if (props.showLabel && (props.labelWidth > 11 || props.labelWidth < 1)) {
        message.push("Label width should be a value between 0 and 12");
    }

    if (message.length) {
        const widgetName = props.friendlyId.split(".")[2];
        const errorMessage = `Configuration error in widget - ${widgetName}: ${message.join(", ")}`;

        return errorMessage;
    }

    return message.join(", ");
};
