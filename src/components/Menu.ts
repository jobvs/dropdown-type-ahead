import { createElement } from "react";
import classNames from "classnames";

export const Menu = (params: any) => {
    const OptionNodes: any[] = [];
    params.options.forEach((option: any) => {
        OptionNodes.push(
            createElement("div", {
            id:  option.value,
            onClick: () => params.selectValue(option),
            onMouseOver: () => params.focusOption(option),
            className: `Select-option ${params.focusedOption && params.focusedOption.value === option.value ? "is-focused" : ""}`,
            role: "option"
        }, option.label));
    });

    return createElement("div", { className: "Select-menu-outer" },
        createElement("div", {
            className: classNames("Select-menu"),
            role: "listbox"
            // id: params.options.map((option: any) => option.label }
        },
        OptionNodes
    )
    );
};
