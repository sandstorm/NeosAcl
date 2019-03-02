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

type Action = AddAction | SetParameterAction;

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
        default:
            return state;
    }
}

export default function PermissionWidget({ }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <PermissionList
            constraints={state.constraints}
            onConstraintAdd={(functionType) => dispatch({ type: 'add', constraintType: functionType })}
            onConditionParameterChange={(conditionIndex, value) => dispatch({ type: 'setParameter', conditionIndex: conditionIndex, value })}
            nodeTypes={[{ value: "NT1", label: "Node Type 1" }, { value: "NT2", label: "Node Type 2" }]}
        />
    );
}
