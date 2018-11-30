import { Component, createElement } from "react";
import * as initializeReactFastclick from "react-fastclick";
import { hot } from "react-hot-loader";

import { AttributeType, parseStyle, validateProps } from "../../SharedResources/utils/ContainerUtils";
import { FetchDataOptions, Nanoflow, fetchData } from "../../SharedResources/utils/Data";
import { DropdownReferenceSet, DropdownReferenceSetProps, ReferenceOption } from "./DropdownReferenceSet";

interface WrapperProps {
    class: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style: string;
    readOnly: boolean;
    friendlyId: string;
}

export interface ContainerProps extends WrapperProps, DropdownReferenceSetProps {
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
    isClearable: boolean;
    options: ReferenceOption[];
    selected: any;
}

class DropdownReferenceSetContainer extends Component<ContainerProps, ContainerState> {
    readonly state: ContainerState = {
        isClearable: this.props.isClearable ? true : false,
        options: [],
        selected: []
    };

    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    private readonly handleOnClick: (selectedOption: ReferenceOption | any) => void = this.onChange.bind(this);

    render() {
        return createElement(DropdownReferenceSet, {
            alertMessage: validateProps(this.props),
            className: this.props.class,
            data: this.state.options,
            asyncData: this.setAsyncOptions,
            emptyOptionCaption: this.props.emptyOptionCaption,
            handleOnchange: this.handleOnClick,
            isClearable: this.props.isClearable,
            selectType: this.props.selectType,
            isReadOnly: this.isReadOnly(),
            labelCaption: this.props.labelCaption ? this.props.labelCaption.trim() : "",
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            readOnlyStyle: this.props.readOnlyStyle,
            selectedValue: this.state.selected,
            searchText: this.props.searchText,
            loadingText: this.props.loadingText,
            minimumCharacter: this.props.minimumCharacter,
            showLabel: this.props.showLabel,
            styleObject: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            const selected = newProps.mxObject.get(this.association) as string;
            this.getSelectedValues(newProps);
            this.resetSubscriptions(newProps.mxObject);
            this.retrieveOptions(newProps);
            this.setState({ selected });
        } else {
            this.setState({ selected: [] });
        }
    }

    componentDidMount() {
        initializeReactFastclick();
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private isReadOnly = (): boolean => {
        const { editable, mxObject, readOnly } = this.props;

        return editable !== "default" || !mxObject || readOnly;
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: () => this.getSelectedValues(this.props),
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.association,
                callback: () => this.getSelectedValues(this.props),
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.props.attribute,
                callback: () => this.getSelectedValues(this.props),
                guid: mxObject.get(this.association) as string
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                entity: this.props.entityPath.split("/")[1],
                callback: () => {
                    this.getSelectedValues(this.props);
                    this.retrieveOptions(this.props);
                }
            }));
        }
    }

    private onChange(recentSelection: ReferenceOption[]) {
        if (this.props.mxObject) {
            const selectedOptions: string[] = [];

            recentSelection.forEach((selection: ReferenceOption) => {
                selectedOptions.push(selection.value as string);
            });

            if (this.state.selected.length > 0) {
                const previousSelection = this.state.selected.map((selection: ReferenceOption) => selection.value as string);
                this.props.mxObject.removeReferences(this.association, previousSelection);
            }

            this.props.mxObject.addReferences(this.association, selectedOptions);

            if (this.state.selected.length !== selectedOptions.length) {
                this.executeOnChangeEvent();
            }

            this.setState({ selected: recentSelection });
        }
    }

    private getSelectedValues = (props: ContainerProps) => {
        new Promise(resolve => props.mxObject.fetch(props.entityPath, resolve))
        .then((values: any) => {
            if (values) {
                const newSelectedObject = values.map((mxObject: mendix.lib.MxObject) => {
                    return {
                        value: mxObject.getGuid(),
                        label: mx.parser.formatAttribute(mxObject, props.attribute)
                    };
                });
                this.setState({
                    selected: newSelectedObject
                });
            } else if (this.props.mxObject.get(this.association) === "") {
                this.setState({
                    isClearable: false,
                    selected: {
                        value: "",
                        label: ""
                    }
                });
            }
        });
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
        const options: ReferenceOption[] = mendixObjects.map(mxObject => {
            return {
                label: mx.parser.formatAttribute(mxObject, this.props.attribute),
                value: mxObject.getGuid()
            };
        });

        this.setState({ options });
    }

    private setAsyncOptions = (input: string): Promise<{ options: ReferenceOption[] }> => {
        if (this.props.mxObject) {
            this.props.mxObject.set(this.props.searchAttribute, input);
            if (input.length >= this.props.minimumCharacter) {
                this.retrieveOptions(this.props);

                return Promise.resolve({ options: this.state.options });
            } else {
                this.getSelectedValues(this.props);

                return Promise.resolve({ options: [] });
            }
        }

        return Promise.resolve({ options: [] });
    }
}

export default hot(module)(DropdownReferenceSetContainer);
