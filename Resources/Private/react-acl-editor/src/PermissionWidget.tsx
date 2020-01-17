import React, { useReducer } from 'react';
import PermissionList from './components/PermissionList';
import produce from "immer";
import { Constraint, ConstraintType } from './types';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree/index'
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

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const withDragDropContext = DragDropContext(HTML5Backend);


function PermissionWidget({name, value, nodeTypes, nodeSearchEndpoint}) {
    const initialValue = (value ? JSON.parse(value) : initialState);
    const [state, dispatch] = useReducer(reducer, initialValue);
    return (
        <>
            <input type="hidden" name={name} value={JSON.stringify(state)} />
            <Tree>
                <Tree.Node>
                    <Tree.Node.Header level={1} label="Label" title="Foo" isCollapsed={false} icon="file-o" hasChildren={true} />
                    <Tree.Node.Contents>
                        <Tree.Node>
                            <Tree.Node.Header level={2} label="Label" title="Foo" isCollapsed={true} icon="file-o" hasChildren={true} />
                        </Tree.Node>
                        <Tree.Node>
                            <Tree.Node.Header level={2} label="Label" title="Foo" isCollapsed={true} icon="file-o" hasChildren={true} />
                        </Tree.Node>
                    </Tree.Node.Contents>
                </Tree.Node>
            </Tree>
        </>
    );
}

export default withDragDropContext(PermissionWidget);
