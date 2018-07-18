import { Component, createElement } from "react";

export interface ReferenceSelectorProps {
    style?: object;
}

export class ReferenceSelector extends Component<ReferenceSelectorProps> {
    render() {
        return createElement("div", { className: "widget-reference-selector-wrapper" });
    }
}
