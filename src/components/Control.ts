import { SFC, createElement } from "react";
import { components } from "react-select";
// import * as classNames from "classnames";

export interface ControlProps {
    children?: Node;
    // innerRef: any;
    // innerProps: {
    //   onMouseDown: (event: React.MouseEvent<HTMLElement>) => void
    // };
}
export const Control: SFC<ControlProps> = (props) =>
    createElement(components.Control as any, {
        className: "widget-dropdown-type-ahead-control",
        ...props
    });

Control.displayName = "Control";
