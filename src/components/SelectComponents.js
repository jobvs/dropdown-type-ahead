import { createElement } from "react";
import classNames from "classnames";


const Control = props => createElement("div", {
  className: classNames("widget-dropdown-type-ahead-control") },
  props.children);

const Menu = props => createElement("div", {
  className: "widget-dropdown-type-ahead-menu"},
  props.children);

const MenuList = props => createElement("div", {
  className: "widget-dropdown-type-ahead-menu-list" },
  props.children);

const NoOptionsMessage = (props) => createElement("div", { className: "no-options"}, "No optionss");

const Placeholder = props => createElement("div", { className: "widget-dropdown-type-ahead-placeholder", ...props });

const Option = props => {
  const { innerProps, isDisabled, isFocused, isSelected } = props;

  return !isDisabled ?
    createElement("div", {
      className: classNames(
        "widget-dropdown-type-ahead-options",
        isFocused ? "is-focused" : null,
        isSelected ? "is-selected" : null
      ),
      ...innerProps
    },
    props.children) :
    null;
};

const ClearIndicator = props => {
  const { innerProps: { ref, ...restInnerProps }} = props;

  return createElement("div", {
      className: "widget-dropdown-type-ahead-clear-container",
      ...restInnerProps,
      ref },
      createElement("svg", {
        className: "widget-dropdown-type-ahead-clear",
        focusable: false,
        height: 20,
        viewBox: "0 0 20 20",
        width: 20 },
        createElement("path", {
          // tslint:disable-next-line:max-line-length
          d:
            "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
        })
    )
  );
};

const DropdownIndicator = props => {
  const { innerProps: { ref, ...restInnerProps }} = props;

  return createElement("div", {
      className: "widget-dropdown-type-ahead-dropdown-container",
      ...restInnerProps,
      ref },
      createElement("svg", {
        className: "widget-dropdown-type-ahead-dropdown",
        // focusable: false,
        height: 20,
        viewBox: "0 0 20 20",
        width: 20 },
        createElement("path", {
          // tslint:disable-next-line:max-line-length
          d:
            "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
        })
    )
  );
};

const Input = props => {
  const { isDisabled } = props;

  return createElement("input", {
      className: classNames("mx-input","form-control-custom", isDisabled ? "disabled" : null ),
      ...props });
};

const IndicatorsContainer = ({ props, children }) => createElement("div", { 
  className: "widget-dropdown-type-ahead-indicators-container",
  ...props },
    children );

const ValueContainer = ({ children, props }) => createElement("div", { 
  className: "widget-dropdown-type-ahead-value-container",
  ...props },
    children
);

const SelectContainer = ({ props, children }) => createElement("div", {
      className: classNames(
        "widget-dropdown-type-ahead-select-container",
        children[1].props.isDisabled ? "disabled" : null ),
      ...props },
        children
  );


const SingleValue = ({ props, children }) => createElement("div", {
  className: "widget-dropdown-type-ahead-single-value",
  ...props },
    children
);

export default {
    Control: Control,
    Menu: Menu,
    NoOptionsMessage: NoOptionsMessage,
    Input: Input,
    ValueContainer: ValueContainer,
    SelectContainer: SelectContainer,
    SingleValue: SingleValue,
    Placeholder: Placeholder,
    ClearIndicator: ClearIndicator,
    DropdownIndicator: DropdownIndicator,
    IndicatorsContainer: IndicatorsContainer,
    MenuList: MenuList,
    Option: Option,
    IndicatorSeparator: null
};
