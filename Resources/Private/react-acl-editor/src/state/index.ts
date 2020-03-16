import produce from "immer";

/**
 * STATE
 */
export interface State {
    readonly selectedWorkspaces: string[];
    readonly selectedDimensionPresets: SelectedDimensionPreset[];
    readonly selectedNodes: SelectedNodes;
}

export type SelectedNodes = {
    [nodeIdentifier: string]: SelectedNodeState
};

type SelectedNodeState = {
    whitelistedNodeTypes: string[]
};

export type SelectedDimensionPreset = {
    dimensionName: string;
    presetName: string;
}

export const initialState: State = {
    selectedWorkspaces: [],
    selectedDimensionPresets: [],
    selectedNodes: {}
};

/**
 * ACTIONS
 */
type SetSelectedWorkspacesAction = {
    type: "setSelectedWorkspaces",
    workspaceNames: string[]
}

export function setSelectedWorkspaces(workspaceNames: string[]): SetSelectedWorkspacesAction {
    return {
        type: 'setSelectedWorkspaces',
        workspaceNames
    };
}

type SetDimensionPresets = {
    type: "setDimensionPresets",
    selectedDimensionPresets: SelectedDimensionPreset[]
}

export function setDimensionPresets(selectedDimensionPresets: SelectedDimensionPreset[]): SetDimensionPresets {
    return {
        type: 'setDimensionPresets',
        selectedDimensionPresets
    };
}


type ToggleNodeSelection = {
    type: "toggleNodeSelection",
    nodeIdentifier: string
}

export function toggleNodeSelection(nodeIdentifier: string): ToggleNodeSelection {
    return {
        type: 'toggleNodeSelection',
        nodeIdentifier
    };
}

type UpdateWhitelistedNodeTypesForNode = {
    type: "updateWhitelistedNodeTypesForNode",
    nodeIdentifier: string,
    whitelistedNodeTypes: string[]
}

export function updateWhitelistedNodeTypesForNode(nodeIdentifier: string, whitelistedNodeTypes: string[]): UpdateWhitelistedNodeTypesForNode {
    return {
        type: 'updateWhitelistedNodeTypesForNode',
        nodeIdentifier,
        whitelistedNodeTypes
    };
}



type Action = SetSelectedWorkspacesAction | SetDimensionPresets | ToggleNodeSelection | UpdateWhitelistedNodeTypesForNode;

/**
 * REDUCER
 */
export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setSelectedWorkspaces':
            return produce(state, draftState => {
                draftState.selectedWorkspaces = action.workspaceNames;
            });
        case 'setDimensionPresets':
            return produce(state, draftState => {
                draftState.selectedDimensionPresets = action.selectedDimensionPresets;
            });
        case 'toggleNodeSelection':
            return produce(state, draftState => {
                if (draftState.selectedNodes[action.nodeIdentifier]) {
                    delete draftState.selectedNodes[action.nodeIdentifier];
                } else {
                    draftState.selectedNodes[action.nodeIdentifier] = {
                        whitelistedNodeTypes: []
                    };
                }
            });
        case 'updateWhitelistedNodeTypesForNode':
            return produce(state, draftState => {
                if (draftState.selectedNodes[action.nodeIdentifier]) {
                    draftState.selectedNodes[action.nodeIdentifier].whitelistedNodeTypes = action.whitelistedNodeTypes;
                }
            });
        default:
            return state;
    }
}
