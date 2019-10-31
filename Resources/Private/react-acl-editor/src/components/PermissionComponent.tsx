import React, { Component } from 'react';
import { Constraint, ConstraintType, NodeType } from '../types';
import NodeTypeSelector from './NodeTypeSelector';
import NodeSelector from "./NodeSelector";

function Workspace() {
    return <div>WS</div>
}

function DimensionPreset() {
    return <div>DimPreset</div>
}

function permissionRenderer(props: PermissionComponentProps): React.ReactElement {
    switch (props.constraint.type) {
        case "isDescendantNodeOf":
        case "isAncestorNodeOf":
        case "isAncestorOrDescendantNodeOf":
            return <NodeSelector
                nodeSearchEndpoint={props.nodeSearchEndpoint}
                value={props.constraint.value}
                onParameterChange={props.onParameterChange}
            />;
        case "nodeIsOfType":
        case "createdNodeIsOfType":
            return <NodeTypeSelector
                nodeTypes={props.nodeTypes}
                value={props.constraint.value}
                onParameterChange={props.onParameterChange}
            />;
        case "isInDimensionPreset":
            return <DimensionPreset />;
        case "isInWorkspace":
            return <Workspace />;
        default:
            return fail(props.constraint.type);

    }
}

interface PermissionComponentProps {
    constraint: Constraint;
    nodeTypes: NodeType[];
    nodeSearchEndpoint: string;
    onParameterChange: (value: string) => void;
    onRemove: () => void;
}

export default function PermissionComponent(props: PermissionComponentProps) {
    const subComponent = permissionRenderer(props);

    return (
        <li>{props.constraint.type}({subComponent}) <a onClick={props.onRemove}>remove</a></li>
    );
}

function fail(message: never) { return <div></div> };
