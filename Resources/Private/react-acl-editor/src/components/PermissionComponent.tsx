import React, { Component } from 'react';
import { Constraint, ConstraintType, NodeType } from '../types';
import NodeTypeSelector from './NodeTypeSelector';

function Workspace() {
    return <div>WS</div>
}

function Node() {
    return <div>N</div>
}

function permissionRenderer(props: PermissionComponentProps): React.ReactElement {
    switch (props.constraint.type) {
        case "isDescendantNodeOf":
        case "isAncestorNodeOf":
        case "isAncestorOrDescendantNodeOf":
            return <Node />;
        case "nodeIsOfType":
        case "createdNodeIsOfType":
        case "isInDimensionPreset":
            return <NodeTypeSelector
                nodeTypes={props.nodeTypes}
                value={props.constraint.value}
                onParameterChange={props.onParameterChange}
            />;
        case "isInWorkspace":
            return <Workspace />;
        default:
            return fail(props.constraint.type);

    }
}

interface PermissionComponentProps {
    constraint: Constraint;
    nodeTypes: NodeType[];
    onParameterChange: (value: string) => void;
}

export default function PermissionComponent(props: PermissionComponentProps) {
    const subComponent = permissionRenderer(props);

    return (
        <li>{props.constraint.type}({subComponent})</li>
    );
}

function fail(message: never) { return <div></div> };
