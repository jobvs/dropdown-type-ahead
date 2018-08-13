import { ChangeEvent, Component, createElement } from "react";
import * as initializeReactFastclick from "react-fastclick";

import { parseStyle } from "../utils/ContainerUtils";
import { FetchDataOptions, FetchedData, Nanoflow, fetchData } from "../utils/Data";
import { AttributeType, DropdownTypeaheadReference, metaData, referenceOption } from "./DropdownTypeaheadReference";

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
    options: referenceOption[];
    selected?: referenceOption;
    isLoading?: boolean;
}

export default class ReferenceSelectorContainer extends Component<ContainerProps, ContainerState> {
    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    readonly state: ContainerState = {
        options: []
    };
    private readonly handleOnClick: ChangeEvent<HTMLDivElement> = this.onChange.bind(this);

    render() {
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
            loaded: this.state.isLoading,
            selectedValue: this.state.selected,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentDidMount() {
        initializeReactFastclick();
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            if (newProps.mxObject.getOriginalReferences(this.association).length !== 0) {
                this.setState({ isLoading: true });
                this.fetchDataByReference(newProps.mxObject)
                    .then((value: mendix.lib.MxObject) => {
                        this.setState({ selected: this.getValue(value), isLoading: false });
                    })
                    .catch(mx.ui.error);
            }
            this.retrieveOptions(newProps);
            this.resetSubscriptions(newProps.mxObject);
        } else {
            this.setState({ selected: undefined });
        }
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private setOptions = (mendixObjects: FetchedData) => {
        const dataOptions: referenceOption[] = [];
        const guids: string[] = [];
        if (this.props.attribute && mendixObjects.mxObjects && mendixObjects.mxObjects.length && !this.isReadOnly()) {
            mendixObjects.mxObjects.forEach(mxObject => {
                dataOptions.push({ label: mxObject.get(this.props.attribute) as string, value: mxObject.getGuid() });
                guids.push(mxObject.getGuid());
            });
        }
        this.setState({ options: dataOptions });
    }

    private isReadOnly = (): boolean => {
        return !this.props.mxObject || (this.props.editable !== "default") || this.props.readOnly;
    }

    private handleSubscriptions = () => {
        if (this.props.mxObject.getOriginalReferences(this.association).length !== 0) {
            this.fetchDataByReference(this.props.mxObject)
                .then((mxObject: mendix.lib.MxObject) => {
                    this.setState({ selected: this.getValue(mxObject) });
                })
                .catch(mx.ui.error);
        }
    }

    private fetchDataByReference(mxObject: mendix.lib.MxObject): Promise<mendix.lib.MxObject> {
        return new Promise((resolve) => mxObject.fetch(this.props.entityPath, resolve));
    }

    private getValue(mxObject: mendix.lib.MxObject) {
        if (mxObject) {
            return {
                label: mxObject.get(this.props.attribute) as string,
                value: mxObject.getGuid()
            };
        }
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

    private onChange(recentSelection: any, info: metaData) {
        if (!this.props.mxObject) {
            return;
        }

        if (info.action === "pop-value") { // TODO:
            if (info.removedValue) {
                this.props.mxObject.removeReferences(this.association, [ info.removedValue.value as string ]);
            } else {
                this.setState({ selected: undefined });
            }
        } else if (info.action === "select-option") {
                this.props.mxObject.addReference(this.association, recentSelection.value as string);
        } else if (info.action === "clear") {
            if (this.state.selected) {
                this.props.mxObject.removeReferences(this.association, [ this.state.selected.value as string ]);
            } else {
                this.setState({ selected: undefined });
            }
        }

        if (this.state.selected && recentSelection) {
            if (this.state.selected.value !== recentSelection.value) {
                this.executeOnChangeEvent();
            }

        }
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
        } else if (props.onChangeEvent === "callNanoflow" && (JSON.stringify(props.onChangeNanoflow) === JSON.stringify({}))) {
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

        fetchData(options).then(this.setOptions.bind(this)).catch(mx.ui.error);
    }
}
