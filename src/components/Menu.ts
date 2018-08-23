import { SFC, createElement } from "react";
// import { components } from "react-select";
import * as classNames from "classnames";

export interface MenuProps {
    children?: Node;
}

export const Menu: SFC<MenuProps> = (props) =>
    createElement("div", {
        className: classNames("widget-dropdown-type-ahead-menu", "form-control", "mx-focus"),
        ...props
    });

Menu.displayName = "Menu";
