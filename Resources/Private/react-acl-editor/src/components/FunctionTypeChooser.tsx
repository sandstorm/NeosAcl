import React, { Component } from 'react';
import Select from 'react-select'
import { ConstraintType } from '../types';
import {selectStyles} from "./helpers";

interface Option {
    value: ConstraintType;
    label: string;
}

const options: Option[] = [
    { value: 'isDescendantNodeOf', label: 'isDescendantNodeOf' },
    { value: 'isAncestorNodeOf', label: 'isAncestorNodeOf' },
    { value: 'isAncestorOrDescendantNodeOf', label: 'isAncestorOrDescendantNodeOf' },
    { value: 'nodeIsOfType', label: 'nodeIsOfType' },
    { value: 'createdNodeIsOfType', label: 'createdNodeIsOfType' },
    //{ value: 'isInWorkspace', label: 'isInWorkspace' },
    //{ value: 'nodePropertyIsIn', label: 'nodePropertyIsIn' },
    //{ value: 'isInDimensionPreset', label: 'isInDimensionPreset' }
];

interface FunctionTypeChooserProps {
    onChoose: (functionName: ConstraintType) => void
};

export default function FunctionTypeChooser(props: FunctionTypeChooserProps) {
    return (
        <div style={{width: 400}}><Select styles={selectStyles} options={options} onChange={(value) => {
            if (Array.isArray(value)) {
                throw new Error("Unexpected type passed to ReactSelect onChange handler");
            }

            if (value && value.value) {
                props.onChoose(value.value);
            }
        }} value={null} placeholder="Choose restriction to add" /></div>
    );
}
