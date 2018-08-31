import { ChangeEvent, Component, createElement } from "react";
import * as initializeReactFastclick from "react-fastclick";

import { parseStyle, validateProps } from "../utils/ContainerUtils";
import { FetchDataOptions, Nanoflow, fetchByMicroflow, fetchData } from "../utils/Data";
import { AttributeType, DropdownTypeaheadReference, ReferenceOption } from "./DropdownTypeaheadReference";

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
    readOnlyStyle: "control" | "text";
    searchAttribute: string;
    searchMicroflow: string;
    selectType: "normal" | "asynchronous";
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
    isLoading: boolean;
}

export default class ReferenceSelectorContainer extends Component<ContainerProps, ContainerState> {
    readonly state: ContainerState = {
        options: [],
        selected: "",
        isLoading: true
    };

    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    private readonly handleOnClick: ChangeEvent<HTMLDivElement> = this.onChange.bind(this);

    render() {
        const selectedValue = this.getSelectedValue(this.state.selected);

        return createElement(DropdownTypeaheadReference as any, {
            alertMessage: validateProps(this.props),
            attribute: this.props.attribute,
            className: this.props.class,
            data: this.state.options,
            asyncData: this.setAsyncOptions,
            emptyCaption: this.props.emptyOptionCaption,
            handleOnchange: this.handleOnClick,
            isClearable: this.props.isClearable,
            selectType: this.props.selectType,
            isReadOnly: this.isReadOnly(),
            loaded: this.state.isLoading,
            label: this.props.labelCaption,
            labelOrientation: this.props.labelOrientation,
            labelWidth: this.props.labelWidth,
            readOnlyStyle: this.props.readOnlyStyle,
            selectedValue,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            const selected = newProps.mxObject.get(this.association) as string;
            this.resetSubscriptions(newProps.mxObject);
            this.retrieveOptions(newProps);
            this.setState({ selected });
        } else {
            this.setState({ selected: "" });
        }
    }

    componentDidMount() {
        initializeReactFastclick();
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private getSelectedValue(selectedGuid: string): ReferenceOption | null {
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
        !recentSelection ? selected = "" : selected = recentSelection.value;

        if (this.state.selected !== recentSelection.value) {
        this.executeOnChangeEvent();
        this.props.mxObject.set(this.association, selected);
        this.setState({ selected });
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

        mendixObjects.forEach(mxObject => {
            options.push({
                label: typeof (mxObject.get(this.props.attribute) as string) !== "string"
                    ? Number(mxObject.get(this.props.attribute)).toString()
                    : mxObject.get(this.props.attribute) as string,
                value: mxObject.getGuid()
            });
        });

        this.setState({ options, isLoading: false });
    }

    private setAsyncOptions = (input: string): Promise<{ options: ReferenceOption[] }> => {
        const filteredOptions: ReferenceOption[] = [];

        if (!input && !this.props.mxObject) {
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
