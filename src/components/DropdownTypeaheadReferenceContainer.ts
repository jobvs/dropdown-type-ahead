import { ChangeEvent, Component, createElement } from "react";
import * as initializeReactFastclick from "react-fastclick";

import { parseStyle } from "../utils/ContainerUtils";
import { FetchDataOptions, Nanoflow, fetchData } from "../utils/Data";
import { AttributeType, DropdownTypeaheadReference, MetaData, ReferenceOption } from "./DropdownTypeaheadReference";

interface WrapperProps {
    class: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style: string;
    readOnly: boolean;
    friendlyId: string;
}

export interface ContainerProps extends WrapperProps {
    labelWidth: number;
    weight: number;
    labelOrientation?: "horizontal" | "vertical";
    attribute: string;
    entityPath: string;
    entityConstraint: string;
    emptyOptionCaption: string;
    labelCaption: string;
    source: "xpath" | "microflow" | "nanoflow";
    sortOrder: "asc" | "desc";
    showLabel: boolean;
    sortAttributes: AttributeType[];
    isClearable: boolean;
    nanoflow: Nanoflow;
    microflow: string;
    onChangeNanoflow: Nanoflow;
    onChangeMicroflow: string;
    onChangeEvent: "callMicroflow" | "callNanoflow";
    editable: "default" | "never";
}

export interface ContainerState {
    options: ReferenceOption[];
    selected: string;
    // isLoading?: boolean;
}

export default class ReferenceSelectorContainer extends Component<ContainerProps, ContainerState> {
    readonly state: ContainerState = {
        options: [],
        selected: ""
    };

    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    private readonly handleOnClick: ChangeEvent<HTMLDivElement> = this.onChange.bind(this);

    render() {
        const selectedValue = this.getSelectedValue(this.state.selected);

        return createElement(DropdownTypeaheadReference as any, {
            alertMessage: this.validateProps(this.props),
            attribute: this.props.attribute,
            className: this.props.class,
            data: this.state.options,
            emptyCaption: this.props.emptyOptionCaption,
            handleOnchange: this.handleOnClick,
            isClearable: this.props.isClearable,
            isReadOnly: this.isReadOnly(),
            label: this.props.labelCaption,
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            // loaded: this.state.isLoading,
            selectedValue,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentDidMount() {
        initializeReactFastclick();
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            const selected = newProps.mxObject.get(this.association) as string;
            this.setState({ selected });
            this.retrieveOptions(newProps);
            this.resetSubscriptions(newProps.mxObject);
        } else {
            this.setState({ selected: "" });
        }
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private getSelectedValue(selectedGuid: string) {
        const selectedOptions = this.state.options.filter(option => option.value === selectedGuid);
        let selected = {};
        if (selectedOptions.length > 0) {
            selected = selectedOptions[0];
        }
        return selected;
    }

    private isReadOnly = (): boolean => {
        return !this.props.mxObject || (this.props.editable !== "default") || this.props.readOnly;
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.association,
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
        }
    }

    private handleSubscriptions = () => {
        const selected = this.props.mxObject.get(this.association) as string;
        this.setState({ selected });
    }

    private onChange(recentSelection: ReferenceOption | any, info: MetaData) {
        if (!this.props.mxObject || this.state.selected === recentSelection.value) {
            return;
        }
        let selected = recentSelection.value;
        if (info.action === "pop-value" || info.action === "clear") {
            selected = "";
        }
        this.props.mxObject.set(this.association, selected);
        this.executeOnChangeEvent();

        this.setState({ selected });
    }

    private executeOnChangeEvent = () => {
        const { mxform, mxObject, onChangeEvent, onChangeMicroflow, onChangeNanoflow } = this.props;
        const context = new mendix.lib.MxContext();

        context.setContext(mxObject.getEntity(), mxObject.getGuid());
        if (onChangeEvent === "callMicroflow" && onChangeMicroflow) {
            window.mx.ui.action(onChangeMicroflow, {
                error: error => window.mx.ui.error(`Error while executing microflow ${onChangeMicroflow}: ${error.message}`), // tslint:disable-line max-line-length
                origin: mxform,
                params: {
                    applyto: "selection",
                    guids: [ mxObject.getGuid() ]
                }
            });
        } else if (onChangeEvent === "callNanoflow" && onChangeNanoflow.nanoflow) {
            window.mx.data.callNanoflow({
                context,
                error: error => window.mx.ui.error(`Error while executing the onchange nanoflow: ${error.message}`),
                nanoflow: onChangeNanoflow,
                origin: mxform
            });
        }
    }

    private validateProps(props: ContainerProps): string {
        const message: string[] = [];

        if (props.onChangeEvent === "callMicroflow" && !props.onChangeMicroflow) {
            message.push("On change event is set to 'Call a microflow' but no microflow is selected");
        } else if (props.onChangeEvent === "callNanoflow" && !props.onChangeNanoflow.nanoflow) {
            message.push("On change event is set to 'Call a nanoflow' but no nanoflow is selected");
        }

        if (props.labelCaption.trim() === "" && props.showLabel && (props.labelWidth > 11 || props.labelWidth < 1)) {
            message.push("Label width should be a value between 0 and 12");
        }

        if (props.labelCaption.trim() === "" && props.showLabel) {
            message.push("Show label is enabled but no label is provided");
        }

        if (message.length) {
            const widgetName = props.friendlyId.split(".")[2];
            const errorMessage = `Configuration error in widget - ${widgetName}: ${message.join(", ")}`;
            return errorMessage;
        }

        return message.join(", ");
    }

    private retrieveOptions(props: ContainerProps) {
        const entity = this.props.entityPath.split("/")[1];
        const { entityConstraint, source, sortOrder, microflow, mxObject, nanoflow } = props;
        const attributeReference = `${props.entityPath}${props.attribute}`;
        const options: FetchDataOptions = {
            attributes: [ attributeReference ],
            constraint: entityConstraint,
            entity,
            guid: mxObject.getGuid(),
            microflow,
            mxform: this.props.mxform,
            nanoflow,
            sortAttributes: this.props.sortAttributes,
            sortOrder,
            source
        };

        fetchData(options)
            .then(optionObjects => this.setOptions(optionObjects))
            .catch(mx.ui.error);
    }

    private setOptions = (mendixObjects: mendix.lib.MxObject[]) => {
        const dataOptions: ReferenceOption[] = [];

        mendixObjects.forEach(mxObject => {
            dataOptions.push({ label: mxObject.get(this.props.attribute) as string, value: mxObject.getGuid() });
        });

        this.setState({ options: dataOptions });
    }
}
