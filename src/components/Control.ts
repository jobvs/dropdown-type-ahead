import { SFC, createElement } from "react";
import { components } from "react-select";
import * as classNames from "classnames";

export interface ControlProps {
    children?: Node;
}
export const Control: SFC<ControlProps> = (props) =>
    createElement(components.Control as any, {
        className: classNames("widget-dropdown-type-ahead-control"),
        ...props
    });

Control.displayName = "Control";
