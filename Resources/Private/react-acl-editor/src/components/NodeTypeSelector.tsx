import React, { Component } from 'react';
import { Constraint, ConstraintType, NodeType } from '../types';
import Select from 'react-select'
import {selectStyles} from "./helpers";

export default function NodeTypeSelector(props: { value: string, nodeTypes: NodeType[], onParameterChange: (value: string) => void }) {
    const selectedNodeType = props.nodeTypes.filter(it => it.value === props.value);
    return <span style={{display: 'inline-block', width: 400}}>
        <Select styles={selectStyles} value={selectedNodeType} options={props.nodeTypes} onChange={(value) => {
            if (Array.isArray(value)) {
                throw new Error("Unexpected type passed to ReactSelect onChange handler");
            }
            if (value && value.value) {
                props.onParameterChange(value.value);
            } else {
                props.onParameterChange("");
            }
        }} placeholder="Choose NodeType to add" />

    </span>
}
