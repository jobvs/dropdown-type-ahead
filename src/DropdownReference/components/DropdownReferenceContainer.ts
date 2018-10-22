import { Component, createElement } from "react";
import * as initializeReactFastclick from "react-fastclick";

import { parseStyle, validateProps } from "../../SharedResources/utils/ContainerUtils";
import { FetchDataOptions, Nanoflow, fetchData } from "../../SharedResources/utils/Data";
import { AttributeType, DropdownReference, DropdownReferenceProps, ReferenceOption } from "./DropdownReference";

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
    selected: string;
    loaded: boolean;
}

export default class DropdownReferenceContainer extends Component<ContainerProps, ContainerState> {
    readonly state: ContainerState = {
        options: [],
        selected: "",
        loaded: true
    };

    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    private readonly handleOnClick: (selectedOption: ReferenceOption | any) => void = this.onChange.bind(this);

    render() {
        const selectedValue = this.getSelectedValue(this.state.selected);

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
            selectedValue,
            showLabel: this.props.showLabel,
            styleObject: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            const selected = newProps.mxObject.get(this.association) as string;
            this.resetSubscriptions(newProps.mxObject);
            if (this.props.selectType === "normal") {
                this.retrieveOptions(newProps);
            }
            this.setState({ selected, loaded: false });
        } else {
            this.setState({ selected: "", loaded: false });
        }
    }

    componentDidMount() {
        initializeReactFastclick();
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private getSelectedValue = (selectedGuid: string): ReferenceOption | null => {
        const selectedOptions = this.state.options.filter(option => option.value === selectedGuid);
        let selected = null;
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
            if (this.state.selected !== recentSelection.value) {
                this.executeOnChangeEvent();
            }
        }

        this.setState({ selected });
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
        const filteredOptions: ReferenceOption[] = [];
        const entity = this.props.entityPath.split("/")[1];
        const { entityConstraint, source, sortOrder, microflow, mxObject, nanoflow } = this.props;
        const attributeReference = `${this.props.entityPath}${this.props.attribute}`;
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

        if (!this.props.mxObject) {
            return Promise.resolve({ options: [] });
        } else {
        this.props.mxObject.set(this.props.searchAttribute, input);

        return fetchData(options).then((mendixObjects) => {
            mendixObjects.forEach(mendixObject => {
                filteredOptions.push({ label: mendixObject.get(this.props.attribute) as string, value: mendixObject.getGuid() });
            });
            this.setState({ options: filteredOptions, loaded: false });

            return { options: filteredOptions };
        });
        }
    }
}
