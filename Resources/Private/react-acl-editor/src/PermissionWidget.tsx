import React, { useReducer, useEffect, useState } from 'react';
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

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const withDragDropContext = DragDropContext(HTML5Backend);

const csrfToken = 'f43213de508b5751ca1e45d2d8a12b1d';
const siteNode = '/sites/neosdemo@user-admin;language=en_US';
import SlimNodeTree from './components/SlimNodeTree';

function PermissionWidget({ name, value, nodeTypes, nodeSearchEndpoint }) {
    const initialValue = (value ? JSON.parse(value) : initialState);

    const [nodes, setNodes] = useState([]);
    useEffect(
        () => {

            fetch('/neos/ui-services/flow-query', {
                credentials: "same-origin",
                method: 'POST',
                headers: {
                    // TODO
                    'X-Flow-Csrftoken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "chain": [{ "type": "createContext", "payload": [{ "$node": siteNode }, { "$node": siteNode }] }, { "type": "neosUiDefaultNodes", "payload": ["Neos.Neos:Document", 4, [], null] }, { "type": "getForTree", "payload": "ALL" }] })
            })
                .then(response => response.json())
                .then(responseJson => {
                    setNodes(responseJson);
                });
        },
        [csrfToken, siteNode]
    );
    const state = {};


    console.log("NODES", nodes);

    return (
        <>
            <input type="hidden" name={name} value={JSON.stringify(state)} />
            <SlimNodeTree nodes={nodes} rootNodeContextPath={siteNode} />
        </>
    );
}

export default withDragDropContext(PermissionWidget);
