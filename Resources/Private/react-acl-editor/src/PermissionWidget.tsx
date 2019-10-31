import React, { useReducer } from 'react';
import PermissionList from './components/PermissionList';
import produce from "immer";
import { Constraint, ConstraintType } from './types';

interface State {
    constraints: Constraint[]
}

type AddAction = {
    type: "add",
    constraintType: ConstraintType
}

type SetParameterAction = {
    type: "setParameter",
    conditionIndex: number,
    value: string
}

type RemoveAction = {
    type: "remove",
    conditionIndex: number
}

type Action = AddAction | SetParameterAction | RemoveAction;

const initialState: State = { constraints: [] };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'add':
            return produce(state, draftState => {
                draftState.constraints.push({
                    type: action.constraintType,
                    value: ""
                });
            });
        case 'setParameter':
            return produce(state, draftState => {
                draftState.constraints[action.conditionIndex].value = action.value
            });
        case 'remove':
            return produce(state, draftState => {
                draftState.constraints.splice(action.conditionIndex, 1);
            });
        default:
            return state;
    }
}

export default function PermissionWidget({name, value, nodeTypes, nodeSearchEndpoint}) {
    const initialValue = (value ? JSON.parse(value) : initialState);
    const [state, dispatch] = useReducer(reducer, initialValue);
    return (
        <>
            <input type="hidden" name={name} value={JSON.stringify(state)} />
            <PermissionList
                constraints={state.constraints}
                onConstraintAdd={(functionType) => dispatch({ type: 'add', constraintType: functionType })}
                onConditionParameterChange={(conditionIndex, value) => dispatch({ type: 'setParameter', conditionIndex: conditionIndex, value })}
                onRemove={(conditionIndex) => dispatch({ type: 'remove', conditionIndex: conditionIndex })}
                nodeTypes={nodeTypes}
                nodeSearchEndpoint={nodeSearchEndpoint}
            />
        </>
    );
}
