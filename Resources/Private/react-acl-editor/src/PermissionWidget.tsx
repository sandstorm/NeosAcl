import React, { useReducer, useEffect, useState } from 'react';
import WorkspaceSelector, { Workspace } from './components/WorkspaceSelector';
import produce from "immer";

interface State {
    readonly selectedWorkspaces: string[];
    readonly dimensionPresets: string[];
}

type SetSelectedWorkspacesAction = {
    type: "setSelectedWorkspaces",
    workspaceNames: string[]
}

type SetDimensionPresets = {
    type: "setDimensionPresets",
    dimensionPresets: string[]
}

type Action = SetSelectedWorkspacesAction | SetDimensionPresets;

const initialState: State = {
    selectedWorkspaces: [],
    dimensionPresets: []
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setSelectedWorkspaces':
            return produce(state, draftState => {
                draftState.selectedWorkspaces = action.workspaceNames;
            });
        case 'setDimensionPresets':
            return produce(state, draftState => {
                draftState.dimensionPresets = action.dimensionPresets;
            });
        default:
            return state;
    }
}

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const withDragDropContext = DragDropContext(HTML5Backend);

// TODO
const siteNode = '/sites/neosdemo@user-admin;language=en_US';
import SlimNodeTree from './components/SlimNodeTree';
import DimensionPresetSelector, {DimensionPreset} from './components/DimensionPresetSelector';
import { NodeType } from './types';

type PermissionWidgetProps = {
    csrfProtectionToken: string,
    workspaces: Workspace[],
    dimensions: DimensionPreset[],
    nodeTypes: NodeType[]
};

function PermissionWidget(props: PermissionWidgetProps) {
    const initialValue = initialState;

    const [nodes, setNodes] = useState([]);

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(
        () => {

            fetch('/neos/ui-services/flow-query', {
                credentials: "same-origin",
                method: 'POST',
                headers: {
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


    return (
        <>
            <input type="hidden" name={name} value={JSON.stringify(state)} />
            <WorkspaceSelector
                workspaces={props.workspaces}
                selectedWorkspaces={state.selectedWorkspaces}
                onSelectedWorkspacesChanged={(workspaceNames) =>
                    dispatch({type: 'setSelectedWorkspaces', workspaceNames}
                )}
            />

            <DimensionPresetSelector
                dimensionPresets={props.dimensions}
                selectedDimensionPresets={state.dimensionPresets}
                onSelectedDimensionPresetsChanged={(dimensionPresets) =>
                    dispatch({type: 'setDimensionPresets', dimensionPresets}
                )}
            />
            <SlimNodeTree nodes={nodes} rootNodeContextPath={siteNode} nodeTypes={props.nodeTypes} />
        </>
    );
}

export default withDragDropContext(PermissionWidget);
