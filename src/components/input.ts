import { SFC, createElement } from "react";
import * as classNames from "classnames";

export interface InputProps {
    disabled?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    hasError?: boolean;
}

export const Input: SFC<InputProps> = (props) =>
        createElement("input", {
            className: classNames("form-control", { "widget-dropdown-type-head-error": props.hasError }),
            type: "text",
            value: props.value,
            onChange: props.onChange
        });

Input.displayName = "Input";
