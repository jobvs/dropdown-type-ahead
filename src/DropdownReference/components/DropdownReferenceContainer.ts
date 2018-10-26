import { Component, createElement } from "react";
import * as initializeReactFastclick from "react-fastclick";

import { AttributeType, parseStyle, validateProps } from "../../SharedResources/utils/ContainerUtils";
import { FetchDataOptions, Nanoflow, fetchData } from "../../SharedResources/utils/Data";
import { DropdownReference, DropdownReferenceProps, ReferenceOption } from "./DropdownReference";

interface WrapperProps {
    class: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style: string;
    readOnly: boolean;
    friendlyId: string;
}

export interface ContainerProps extends WrapperProps, DropdownReferenceProps {
    attribute: string;
    entityPath: string;
    entityConstraint: string;
    searchAttribute: string;
    source: "xpath" | "microflow" | "nanoflow";
    sortOrder: "asc" | "desc";
    sortAttributes: AttributeType[];
    nanoflow: Nanoflow;
    microflow: string;
    onChangeNanoflow: Nanoflow;
    onChangeMicroflow: string;
    onChangeEvent: "callMicroflow" | "callNanoflow";
    editable: "default" | "never";
}

export interface ContainerState {
    options: ReferenceOption[];
    selectedObject: ReferenceOption | null;
    loaded: boolean;
}

export default class DropdownReferenceContainer extends Component<ContainerProps, ContainerState> {
    readonly state: ContainerState = {
        options: [],
        loaded: true,
        selectedObject: {}
    };

    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    private readonly handleOnClick: (selectedOption: ReferenceOption | any) => void = this.onChange.bind(this);

    render() {
        return createElement(DropdownReference, {
            alertMessage: validateProps(this.props),
            className: this.props.class,
            data: this.state.options,
            asyncData: this.setAsyncOptions,
            emptyOptionCaption: this.props.emptyOptionCaption,
            handleOnchange: this.handleOnClick,
            isClearable: this.props.isClearable,
            selectType: this.props.selectType,
            isReadOnly: this.isReadOnly(),
            loaded: !this.state.loaded,
            labelCaption: this.props.labelCaption ? this.props.labelCaption.trim() : "",
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            readOnlyStyle: this.props.readOnlyStyle,
            searchText: this.props.searchText,
            loadingText: this.props.loadingText,
            minimumCharacter: this.props.minimumCharacter,
            selectedValue: this.state.selectedObject,
            showLabel: this.props.showLabel,
            styleObject: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            this.getSelectedValue(newProps);
            this.resetSubscriptions(newProps.mxObject);
            if (this.props.selectType === "normal") {
                this.retrieveOptions(newProps);
            }
            this.setState({ loaded: false });
        } else {
            this.setState({ loaded: false });
        }
    }

    componentDidMount() {
        initializeReactFastclick();
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private getSelectedValue = (props: ContainerProps) => {
        new Promise((resolve) => props.mxObject.fetch(props.entityPath, resolve))
        .then((newValue: any) => {
            if (newValue) {
                this.setState({
                    selectedObject: {
                        value: newValue.getGuid(),
                        label: mx.parser.formatAttribute(newValue, props.attribute)
                    }
                });
            }
        });
    }

    private isReadOnly = (): boolean => {
        const { editable, mxObject, readOnly, attribute } = this.props;

        return editable !== "default" || (!mxObject || readOnly || !!(attribute && mxObject.isReadonlyAttr(attribute)));
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
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.props.attribute,
                callback: this.handleSubscriptions,
                guid: mxObject.get(this.association) as string
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                entity: this.props.entityPath.split("/")[1],
                callback: () => {
                    this.setState({ selectedObject: null });
                    this.getSelectedValue(this.props);
                    this.retrieveOptions(this.props);
                }
            }));
        }
    }

    private handleSubscriptions = () => {
        this.getSelectedValue(this.props);
    }

    private onChange(recentSelection: ReferenceOption | any) {
        if (!this.props.mxObject) {
            return;
        }

        let selected = "";

        if (!recentSelection) {
            selected = "";
            this.props.mxObject.set(this.association, selected);
        } else {
            selected = recentSelection.value;
            this.props.mxObject.set(this.association, selected);
            if (!this.state.selectedObject || (this.state.selectedObject.value !== recentSelection.value)) {
                this.executeOnChangeEvent();
            }
        }

        this.setState({ selectedObject: recentSelection ? recentSelection : null });
    }

    private executeOnChangeEvent = () => {
        const { mxform, mxObject, onChangeEvent, onChangeMicroflow, onChangeNanoflow } = this.props;
        const context = new mendix.lib.MxContext();

        context.setContext(mxObject.getEntity(), mxObject.getGuid());
        if (onChangeEvent === "callMicroflow" && onChangeMicroflow) {
            window.mx.ui.action(onChangeMicroflow, {
                error: error => window.mx.ui.error(`Error while executing onchange microflow ${onChangeMicroflow}: ${error.message}`), // tslint:disable-line max-line-length
                origin: mxform,
                params: {
                    applyto: "selection",
                    guids: [ mxObject.getGuid() ]
                }
            });
        } else if (onChangeEvent === "callNanoflow" && onChangeNanoflow.nanoflow) {
            window.mx.data.callNanoflow({
                context,
                error: error => window.mx.ui.error(`Error while executing onchange nanoflow: ${error.message}`),
                nanoflow: onChangeNanoflow,
                origin: mxform
            });
        }
    }

    private retrieveOptions(props: ContainerProps) {
        const entity = this.props.entityPath.split("/")[1];
        const { sortAttributes, attribute, entityConstraint, source, sortOrder, microflow, mxObject, nanoflow } = props;
        const attributeReference = `${props.entityPath}${attribute}`;
        const options: FetchDataOptions = {
            attributes: [ attributeReference ],
            constraint: entityConstraint,
            entity,
            guid: mxObject.getGuid(),
            microflow,
            mxform: this.props.mxform,
            nanoflow,
            sortAttributes: !sortAttributes.length ?
                [ { name: attribute , sort: "asc" } ] :
                sortAttributes,
            sortOrder,
            source
        };

        fetchData(options)
            .then(optionObjects => this.setOptions(optionObjects))
            .catch(errorMessage => window.mx.ui.error(errorMessage.message));
    }

    private setOptions = (mendixObjects: mendix.lib.MxObject[]) => {
        const options: ReferenceOption[] = [];

        mendixObjects.forEach(mxObject => {
            options.push({
                label: mx.parser.formatAttribute(mxObject, this.props.attribute),
                value: mxObject.getGuid()
            });
        });

        this.setState({ options, loaded: false });
    }

    private setAsyncOptions = (input: string): Promise<{ options: ReferenceOption[] }> => {
        if (!this.props.mxObject) {
            return Promise.resolve({ options: [] });
        } else {
            this.props.mxObject.set(this.props.searchAttribute, input);
            if (input.length >= this.props.minimumCharacter) {
                this.retrieveOptions(this.props);

                return Promise.resolve({ options: this.state.options });
            } else {
                this.getSelectedValue(this.props);

                return Promise.resolve({ options: [ this.state.selectedObject ? this.state.selectedObject : {} ] });
            }
        }
    }
}
