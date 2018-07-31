import { ChangeEvent, Component, createElement } from "react";
import { parseStyle } from "../utils/ContainerUtils";
import { FetchDataOptions, FetchedData, Nanoflow, fetchData } from "../utils/Data";
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
    selected: referenceOption | undefined;
}

export default class ReferenceSelectorContainer extends Component<ContainerProps, ContainerState> {
    private subscriptionHandles: number[] = [];
    private association: string = this.props.entityPath.split("/")[0];
    // private editable = true;
    readonly state: ContainerState = {
        options: [],
        selected: {}
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
            selectedValue: this.state.selected,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ContainerProps) {
        if (JSON.stringify(this.state.selected) === "{}") {
            if (newProps.mxObject.getOriginalReferences(this.association).length !== 0) {
            Promise.all([ this.fetchDataByreference(newProps.mxObject) ])
            .then((values: mendix.lib.MxObject[]) => {
                if (values.length !== 0) {
                const MendixObject = values[0];
                this.setState({ selected: this.getValue(MendixObject) });
                }
            })
            .catch(mx.ui.error);
        }
        }

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
                    dataOptions.push({ label: mxObject.get(this.props.attribute) as string, value: mxObject.getGuid() });
                }
            }
            this.setState({ options: dataOptions });
        }).catch(mx.ui.error);
    }

    private isReadOnly = (): boolean => {
        if (this.props.editable !== "default") {
            return true;
        }
        // else if (!this.editable) {
        //     return true;
        // }
        return false;
    }

    private handleSubscriptions = () => {
        if (this.props.mxObject.getOriginalReferences(this.association).length !== 0) {
        Promise.all([ this.fetchDataByreference(this.props.mxObject) ])
            .then((values: mendix.lib.MxObject[]) => {
                const MendixObject = values[0];
                this.setState({ selected: this.getValue(MendixObject) });
            })
            .catch(mx.ui.error);
        }
    }

    private fetchDataByreference(mxObject: mendix.lib.MxObject): Promise<mendix.lib.MxObject> {
        return new Promise((resolve) => mxObject.fetch(this.props.entityPath, resolve));
    }

    private getValue(mxObject: mendix.lib.MxObject) {
        if (mxObject) {
            return {
                label: mxObject.get(this.props.attribute) as string,
                value: mxObject.getGuid()
            };
        } else return;
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

    private onChange(recentSelection: referenceOption) {
        if (!this.props.mxObject) {
            return;
        }
        if (this.props.isClearable) {
        if (!recentSelection && this.state.selected) {
                 this.props.mxObject.removeReferences(this.props.entityPath.split("/")[0], [ this.state.selected.value as string ]);
            } else {
                // this.props.mxObject.set(this.props.attribute, "");
                this.props.mxObject.addReference(this.props.entityPath.split("/")[0], recentSelection.value as any);
            }
        }
        // else {
        //     this.props.mxObject.removeReferences(this.props.entityPath.split("/")[0], [ recentSelection.value as string ]);
        // }
        // this.props.mxObject.addReference(this.props.entityPath.split("/")[0], recentSelection.value as string);
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

    private validateProps(props: ContainerProps): string {
        const message: string[] = [];

        if (props.onChangeEvent === "callMicroflow" && !props.onChangeMicroflow) {
            message.push("On change event is set to 'Call a microflow' but no microflow is selected");
        } else if (props.onChangeEvent === "callNanoflow" && (JSON.stringify(props.onChangeNanoflow) === JSON.stringify({}))) {
            message.push("On change event is set to 'Call a nanoflow' but no nanoflow is selected");
        } else if (props.labelCaption.trim() === "" && props.showLabel === true) {
            message.push("Show label is enabled but no label is provided");
        }

        if (message.length) {
            const errorMessage = `Configuration error in widget ${props.friendlyId}: ${message.join(", ")}`;
            // this.editable = false;
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
            sortOrder,
            source
        };

        this.setOptions(fetchData(options));
    }
}
