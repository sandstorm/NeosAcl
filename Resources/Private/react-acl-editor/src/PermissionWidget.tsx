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
    workspaces: Workspace[],
    dimensions: DimensionPreset[],
    nodeTypes: NodeType[],

    /**
     * Field name where the permission widget stores its data.
     */
    name: string,

    initialState: State,
};

function PermissionWidget(props: PermissionWidgetProps) {
    const [state, dispatch] = useReducer(reducer, props.initialState || initialState);

    const nodes = useNodeTree(props.csrfProtectionToken, props.siteNode)


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
                selectedDimensionPresets={state.dimensionPresets}
                onSelectedDimensionPresetsChanged={(dimensionPresets) =>
                    dispatch(setDimensionPresets(dimensionPresets))
                }
            />
            <SlimNodeTree nodes={nodes} rootNodeContextPath={props.siteNode} nodeTypes={props.nodeTypes} dispatch={dispatch} selectedNodes={state.selectedNodes} />
        </>
    );
}

export default withDragDropContext(PermissionWidget);
