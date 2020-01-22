import React, { useReducer, useEffect, useState } from 'react';
import WorkspaceSelector, { Workspace } from './components/WorkspaceSelector';
import produce from "immer";
import { Constraint, ConstraintType } from './types';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox/index';

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

const siteNode = '/sites/neosdemo@user-admin;language=en_US';
import SlimNodeTree from './components/SlimNodeTree';

type PermissionWidgetProps = {
    csrfProtectionToken: string,
    workspaces: Workspace[]

};

function PermissionWidget(props: PermissionWidgetProps) {
    const initialValue = initialState;

    const [nodes, setNodes] = useState([]);
    useEffect(
        () => {

            fetch('/neos/ui-services/flow-query', {
                credentials: "same-origin",
                method: 'POST',
                headers: {
                    // TODO
                    'X-Flow-Csrftoken': props.csrfProtectionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "chain": [{ "type": "createContext", "payload": [{ "$node": siteNode }, { "$node": siteNode }] }, { "type": "neosUiDefaultNodes", "payload": ["Neos.Neos:Document", 4, [], null] }, { "type": "getForTree", "payload": "ALL" }] })
            })
                .then(response => response.json())
                .then(responseJson => {
                    setNodes(responseJson);
                });
        },
        [props.csrfProtectionToken, siteNode]
    );
    const state = {};


    const opts = [
        {
            label: 'Foo',
            value: 'bla'
        },
        {
            label: 'Foo2',
            value: 'bla2'
        },
        {
            label: 'Foo3',
            value: 'bla3'
        }
    ];

    return (
        <>
            <input type="hidden" name={name} value={JSON.stringify(state)} />
            <WorkspaceSelector workspaces={props.workspaces} />
            <SelectBox options={[
                {
                    label: 'Foo',
                    value: 'bla'
                },
                {
                    label: 'Foo2',
                    value: 'bla2'
                }
            ]} optionValueField="value" placeholder="Test" />
            B
            <SlimNodeTree nodes={nodes} rootNodeContextPath={siteNode} />
        </>
    );
}

export default withDragDropContext(PermissionWidget);
