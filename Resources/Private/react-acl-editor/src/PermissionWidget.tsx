import React, { useReducer, useEffect, useState } from 'react';
import WorkspaceSelector, { Workspace } from './components/WorkspaceSelector';
import {initialState, State, reducer, setSelectedWorkspaces, setDimensionPresets} from './state/index';
import {useNodeTree} from './hooks/useNodeTree';


import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const withDragDropContext = DragDropContext(HTML5Backend);

import SlimNodeTree from './components/SlimNodeTree';
import DimensionPresetSelector, {DimensionPreset} from './components/DimensionPresetSelector';
import { NodeType } from './types';

type PermissionWidgetProps = {
    csrfProtectionToken: string,
    siteNode: string,
    nodeTreeLoadingDepth: number,
    workspaces: Workspace[],
    dimensions: DimensionPreset[],
    expandedNodes: string[],
    nodeTypes: NodeType[],

    /**
     * Field name where the permission widget stores its data.
     */
    name: string,

    initialState: State,
};

function PermissionWidget(props: PermissionWidgetProps) {
    const [state, dispatch] = useReducer(reducer, props.initialState || initialState);

    const {nodes, loadAdditionalNodes} = useNodeTree(props.csrfProtectionToken, props.siteNode, props.expandedNodes, props.nodeTreeLoadingDepth);

    return (
        <>
            <input type="hidden" name={props.name} value={JSON.stringify(state)} />
            <WorkspaceSelector
                workspaces={props.workspaces}
                selectedWorkspaces={state.selectedWorkspaces}
                onSelectedWorkspacesChanged={(workspaceNames) =>
                    dispatch(setSelectedWorkspaces(workspaceNames))
                }
            />

            <DimensionPresetSelector
                dimensionPresets={props.dimensions}
                selectedDimensionPresets={state.selectedDimensionPresets}
                onSelectedDimensionPresetsChanged={(dimensionPresets) =>
                    dispatch(setDimensionPresets(dimensionPresets))
                }
            />
            <SlimNodeTree nodes={nodes} loadAdditionalNodes={loadAdditionalNodes} rootNodeContextPath={props.siteNode} nodeTypes={props.nodeTypes} dispatch={dispatch} selectedNodes={state.selectedNodes} />
        </>
    );
}

export default withDragDropContext(PermissionWidget);
