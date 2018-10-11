import { ChangeEvent, Component, createElement } from "react";
import * as initializeReactFastclick from "react-fastclick";

import { parseStyle, validateProps } from "../utils/ContainerUtils";
import { FetchDataOptions, Nanoflow, fetchByMicroflow, fetchData } from "../utils/Data";
import { AttributeType, DropdownTypeahead, DropdownTypeaheadProps, ReferenceOption } from "./DropdownTypeaheadReferenceSet";

interface WrapperProps {
    class: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style: string;
    readOnly: boolean;
    friendlyId: string;
}

export interface ContainerProps extends WrapperProps, DropdownTypeaheadProps {
    attribute: string;
    entityPath: string;
    entityConstraint: string;
    searchAttribute: string;
    searchMicroflow: string;
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
    selected: any;
    isLoading: boolean;
}

export default class DropdownTypeaheadContainer extends Component<ContainerProps, ContainerState> {
    readonly state: ContainerState = {
        options: [],
        selected: [],
        isLoading: true
    };

    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    private readonly handleOnClick: ChangeEvent<HTMLDivElement> = this.onChange.bind(this);

    render() {
        return createElement(DropdownTypeahead as any, {
            alertMessage: validateProps(this.props),
            attribute: this.props.attribute,
            className: this.props.class,
            data: this.state.options,
            asyncData: this.setAsyncOptions,
            emptyOptionCaption: this.props.emptyOptionCaption,
            handleOnchange: this.handleOnClick,
            isClearable: this.props.isClearable,
            selectType: this.props.selectType,
            isReadOnly: this.isReadOnly(),
            loaded: this.state.isLoading,
            labelCaption: this.props.labelCaption,
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            readOnlyStyle: this.props.readOnlyStyle,
            selectedValue: this.state.selected,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            const selected = newProps.mxObject.get(this.association) as string;
            this.resetSubscriptions(newProps.mxObject);
            if (this.props.selectType === "normal") {
                this.retrieveOptions(newProps);
            }
            this.setState({ selected, isLoading: false });
        } else {
            this.setState({ selected: [] , isLoading: false });
        }
    }

    componentDidMount() {
        initializeReactFastclick();
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
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

    private onChange(recentSelection: ReferenceOption[] | any) {
        if (!this.props.mxObject) {
            return;
        }

        const selectedOptions: string[] = [];

        recentSelection.forEach((selection: ReferenceOption) => {
            selectedOptions.push(selection.value as string);
        });

        this.props.mxObject.removeReferences(this.association, this.state.selected);
        this.props.mxObject.addReferences(this.association, selectedOptions);

        if (this.state.selected.length !== selectedOptions.length) {
            this.executeOnChangeEvent();
        }

        this.setState({ selected: selectedOptions });
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
        const options: ReferenceOption[] = [];

        if (mendixObjects.length > 0) {
            mendixObjects.forEach(mxObject => {
                options.push({
                    label: mx.parser.formatAttribute(mxObject, this.props.attribute),
                    value: mxObject.getGuid()
                });
            });
        }

        this.setState({ options });
    }

    private setAsyncOptions = (input: string): Promise<{ options: ReferenceOption[] }> => {
        const filteredOptions: ReferenceOption[] = [];

        if (input === "" && !this.props.mxObject) {
            return Promise.resolve({ options: [] });
        } else {
            this.props.mxObject.set(this.props.searchAttribute, input);

            return fetchByMicroflow(this.props.searchMicroflow, this.props.mxObject.getGuid()).then((mendixObjects) => {
                mendixObjects.forEach(mxObject => {
                    filteredOptions.push({ label: mxObject.get(this.props.attribute) as string, value: mxObject.getGuid() });
                });

                return { options: filteredOptions, isLoading: false };
            });
        }
    }
}
