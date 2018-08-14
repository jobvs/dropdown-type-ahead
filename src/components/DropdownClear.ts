import { SFC, createElement } from "react";
import * as classNames from "classnames";

export interface DropdownClearProps {
    children?: Node;
    innerProps: any;
    ref: any;
    getStyles: any;
}

export const DropdownClear: SFC<DropdownClearProps> = (props) => {
    const { getStyles, innerProps: { ref, ...restInnerProps } } = props;
    return createElement("div", {
        className: "widget-dropdown-type-head-clear-container",
        ...restInnerProps,
        ref,
        style: getStyles("clearIndicator", props)
    },
        createElement("svg", {
            className: classNames("widget-dropdown-type-head-clear"),
            focusable: false,
            height: 20,
            viewBox: "0 0 20 20",
            width: 20
        },
            createElement("path", {
                // tslint:disable-next-line:max-line-length
                d: "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
            })));
};

DropdownClear.displayName = "DropdownClear";
