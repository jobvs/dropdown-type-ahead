import { ChangeEvent, Component, createElement } from "react";
import { parseStyle } from "../utils/ContainerUtils";
import { FetchDataOptions, FetchedData, fetchData } from "../utils/data";
import { DropdownTypeaheadReference, referenceOption } from "./DropdownTypeaheadReference";

interface WrapperProps {
    class: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style: string;
    readOnly: boolean;
    friendlyId: string;
}

export interface ContainerProps extends WrapperProps {
    attribute: string;
    entityPath: string;
    entityConstraint: string;
    emptyOptionCaption: string;
    labelCaption: string;
    source: "xpath"| "microflow" | "nanoflow";
    sortOrder: "asc" | "desc";
    showLabel: boolean;
    nanoflow: Nanoflow;
    microflow: string;
    onChangeNanoflow: Nanoflow;
    onChangeMicroflow: string;
    onChangeEvent: "callMicroflow" | "callNanoflow";
    editable: "default" | "never";
}

export interface ContainerState {
    options: referenceOption[];
    selected: referenceOption;
}

// TODO: Move to data typings
export interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

// TODO: Names of Props is too long
export default class ReferenceSelectorContainer extends Component<ContainerProps, ContainerState> {
    private subscriptionHandles: number[] = [];
    readonly state: ContainerState = {
        options: [],
        selected: {}
    };
    private readonly handleOnClick: ChangeEvent<HTMLDivElement> = this.onChange.bind(this);
    // private readonly executeOnChangeEvent:  = this.executeOnChangeEvent.bind(this);

    render() {
        return createElement(DropdownTypeaheadReference as any, {
            attribute: this.props.attribute,
            data: this.state.options,
            emptyCaption: this.props.emptyOptionCaption,
            handleOnchange: this.handleOnClick,
            isReadOnly: this.isReadOnly(),
            label: this.props.labelCaption,
            selectedValue: this.state.selected,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (newProps.mxObject && (newProps.mxObject !== this.props.mxObject)) {
            this.retrieveOptions(newProps);
            this.resetSubscriptions(newProps.mxObject);
        }
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private setOptions = (Data: Promise<FetchedData>) => {
        const dataOptions: referenceOption[] = [];

        Promise.all([ Data ])
        .then((value: FetchedData[]) => {
            const mendixObjects = value[0].mxObjects;
            if (this.props.attribute && mendixObjects) {
                for (const mxObject of mendixObjects) {
                    dataOptions.push({ label: mxObject.get(this.props.attribute) as string, guid: mxObject.getGuid() });
                }
            }
            this.setState({ options: dataOptions });
        });
    }

    private isReadOnly = (): boolean => this.props.editable !== "default";

    private handleSubscriptions = () => {
        Promise.all([ this.fetchDataByreference() ])
            .then((values: mendix.lib.MxObject[]) => {
                const MendixObject = values[0];
                this.setState({ selected: this.getValue(MendixObject) });
            })
            .catch(mx.ui.error);
    }

    private fetchDataByreference(): Promise<mendix.lib.MxObject> {
        return new Promise((resolve) => this.props.mxObject.fetch(this.props.entityPath, resolve));
    }

    private getValue(mxObject: mendix.lib.MxObject) {
        return {
            guid: mxObject.getGuid(),
            label: mxObject.get(this.props.attribute) as string
        };
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];
        const attr = this.props.entityPath.split("/")[0];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr,
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
        }
    }

    private onChange(recentSelection: referenceOption) {
        if (!this.props.mxObject) {
            return;
        }

        if (recentSelection.guid) {
        this.props.mxObject.addReference(this.props.entityPath.split("/")[0], recentSelection.guid);
        }
        this.executeOnChangeEvent();
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
            sortOrder,
            source
        };

        this.setOptions(fetchData(options));
    }
}
