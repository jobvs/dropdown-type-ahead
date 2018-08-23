import { SFC, createElement } from "react";
// import { components } from "react-select";
// import * as classNames from "classnames";

export interface IndicatorsContainerProps {
    children?: Node;
}

export const IndicatorsContainer: SFC<IndicatorsContainerProps> = (props) => {
    return createElement("div" , {
        ...props, className: "widget-dropdown-type-head-indicator-container"
     }
    );
};

IndicatorsContainer.displayName = "IndicatorsContainer";
