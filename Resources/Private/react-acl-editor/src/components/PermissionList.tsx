import { Constraint, ConstraintType, NodeType } from '../types';
import React, { Component } from 'react';
import PermissionComponent from './PermissionComponent';
import FunctionTypeChooser from './FunctionTypeChooser';

interface PermissionListProps {
    constraints: Constraint[];
    onConstraintAdd: (functionName: ConstraintType) => void,
    onConditionParameterChange: (index: number, value: string) => void,
    nodeTypes: NodeType[];
    nodeSearchEndpoint: string;
}


export default function PermissionList(props: PermissionListProps) {
    return (
        <ul>
            {props.constraints.map((constraint, i) =>
                <PermissionComponent
                    key={i}
                    constraint={constraint}
                    nodeTypes={props.nodeTypes}
                    nodeSearchEndpoint={props.nodeSearchEndpoint}
                    onParameterChange={value => props.onConditionParameterChange(i, value)}
                />
            )}
            <FunctionTypeChooser onChoose={props.onConstraintAdd} />
        </ul>
    );
}
