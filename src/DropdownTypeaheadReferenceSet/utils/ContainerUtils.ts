import { ContainerProps } from "../components/DropdownTypeaheadReferenceSetContainer";

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

export const validateProps = (props: ContainerProps): string => {
    const message: string[] = [];

    if (props.onChangeEvent === "callMicroflow" && !props.onChangeMicroflow) {
        message.push("On change event is set to 'Call a microflow' but no microflow is selected");
    } else if (props.onChangeEvent === "callNanoflow" && !props.onChangeNanoflow.nanoflow) {
        message.push("On change event is set to 'Call a nanoflow' but no nanoflow is selected");
    }

    if (props.labelCaption.trim() === "" && props.showLabel && (props.labelWidth > 11 || props.labelWidth < 1)) {
        message.push("Label width should be a value between 0 and 12");
    }

    if (props.labelCaption.trim() === "" && props.showLabel) {
        message.push("Show label is enabled but no label is provided");
    }

    if (props.selectType === "asynchronous" && !props.searchMicroflow) {
        message.push("Asynchronous loading requires a search microflow but none is provided");
    }

    if (message.length) {
        const widgetName = props.friendlyId.split(".")[2];
        const errorMessage = `Configuration error in widget - ${widgetName}: ${message.join(", ")}`;

        return errorMessage;
    }

    return message.join(", ");
};
