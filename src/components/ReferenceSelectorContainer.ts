import { Component, createElement } from "react";
import { parseStyle } from "../utils/ContainerUtils";

interface WrapperProps {
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    mxContext: mendix.lib.MxContext;
    style?: string;
    class?: string;
}

export interface ReferenceSelectorContainerProps extends WrapperProps {
    attribute: string;
}

export default class ReferenceSelectorContainer extends Component<ReferenceSelectorContainerProps, {}> {
    constructor(props: ReferenceSelectorContainerProps) {
        super(props);
    }

    render() {
        return createElement("div", {
            style: parseStyle(this.props.style)
        });
    }
}
