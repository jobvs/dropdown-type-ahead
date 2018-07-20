import { Component, createElement } from "react";
import { parseStyle } from "../utils/ContainerUtils";
import { FetchDataOptions, FetchedData, fetchData } from "../utils/data";
import { ReferenceSelector, referenceOption, selector } from "./ReferenceSelector";

interface WrapperProps {
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    mxContext: mendix.lib.MxContext;
    style?: string;
    class?: string;
}

export interface ReferenceSelectorContainerProps extends WrapperProps {
    emptyOptionCaption: string;
    attribute: string;
    selectorType: selector;
    goToPage: string;
    source: "xpath"| "microflow" | "nanoflow";
    entityConstraint: string;
    sortOrder: "asc" | "des";
    dataEntity: string;
    microflow: string;
    nanoflow: Nanoflow;
    selectableAttribute: string;
    labelCaption: string;
    showLabel: string;
}

export interface ReferenceSelectorState {
    options: referenceOption[];
    selected: referenceOption;
    showOverlay: boolean;
}

export interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

export default class ReferenceSelectorContainer extends Component<ReferenceSelectorContainerProps, ReferenceSelectorState> {
    private subscriptionHandles: number[] = [];

    constructor(props: ReferenceSelectorContainerProps) {
        super(props);

        this.state = {
            options: [],
            selected: { value: "select" , label: this.props.emptyOptionCaption },
            showOverlay: false
        };

        this.onChange = this.onChange.bind(this);
    }

    render() {
        return createElement(ReferenceSelector as any, {
            attribute: this.props.selectableAttribute,
            data: this.state.options,
            handleClick: this.onClick,
            handleOnchange: this.onChange,
            label: this.props.labelCaption,
            selectedValue: this.state.selected,
            selectorType: this.props.selectorType,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ReferenceSelectorContainerProps) {
        if (newProps.mxObject !== this.props.mxObject) {
        this.retrieveOptions(newProps);
        this.resetSubscriptions(newProps.mxObject);
        }
        // tslint:disable-next-line:no-console
        // console.log(this.props.attribute);
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private setOptions = (item: Promise<FetchedData>) => {
        const dataOptions: referenceOption[] = [];

        Promise.all([ item ])
        .then((values) => {
            const mx = values[0].mxObjects;
            if (this.props.selectableAttribute && mx) {
                for (const mxObject of mx) {
                    dataOptions.push({ label: mxObject.get(this.props.selectableAttribute) as string, value: mxObject.getGuid() });
                }
            }

            this.setState({ options: dataOptions });
        });
    }

    private handleSubscriptions = () => {
        this.setState({ selected: this.getValue(this.props.mxObject) });
    }

    private getValue(mxObject: mendix.lib.MxObject) {
        return {
            label: mxObject.get(this.props.selectableAttribute) as string,
            value: mxObject.getGuid()
        };
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];
        // mxObject.addReference("MyFirstModule.MendixUser_City", mxObject.getGuid());
        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.props.selectableAttribute,
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
        }
    }

    private onChange(newValue: referenceOption) {
        if (!this.props.mxObject) {
            return;
        }
        this.props.mxObject.addReference(this.props.attribute.split("/")[0], newValue.value);
        // this.props.mxObject.set(this.props.selectableAttribute, newValue.label);
        this.setState({ selected: newValue });
    }

    private onClick = () => {
        this.setState({ showOverlay: true });
        document.body.appendChild(this.createOverlay());
        window.mx.ui.openForm(this.props.goToPage, {
            callback: (form: mxui.lib.form._FormBase) => {
            form.listen("submit", () => {
                    const label = (form.domNode.getElementsByClassName("selected")[0].lastChild as any).title;
                    this.props.mxObject.set(this.props.selectableAttribute, label);
                    form.close();
                    document.body.removeChild(document.body.childNodes[document.body.childNodes.length - 2]);
                });
            },
            error: (error: Error) => window.mx.ui.error(`Error while opening page ${this.props.goToPage}: ${error.message}`),
            location: "popup"
        });
    }

    private retrieveOptions(props: ReferenceSelectorContainerProps) {
        // const reference = this.props.attribute.split("/")[0]
        // "MyFirstModule.MendixUser_City"
        const selectEntity = this.props.attribute.split("/")[1];
        // "MyFirstModule.City"
        // const attributes = this.props.attribute.split("/")[2]
        // "CityName"
        const { entityConstraint, source, sortOrder, microflow, mxObject, nanoflow } = props;
        const options = {
            constraint: entityConstraint,
            entity: selectEntity,
            guid: mxObject.getGuid(),
            microflow,
            mxform: this.props.mxform,
            nanoflow,
            sortOrder,
            source
        };

        this.setOptions(fetchData(options as FetchDataOptions));
    }

    private createOverlay(): Node {
        const overlay = document.createElement("div");

        overlay.className = "widget-overlay";
        overlay.id = "widget-overlay-id";

        return overlay;
    }
}
