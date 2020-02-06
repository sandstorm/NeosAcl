import produce from "immer";

/**
 * STATE
 */
export interface State {
    readonly selectedWorkspaces: string[];
    readonly dimensionPresets: string[];
    readonly selectedNodes: SelectedNodes;
}

export type SelectedNodes = {
    [nodeIdentifier: string]: SelectedNodeState
};

type SelectedNodeState = {
    whitelistedNodeTypes: string[]
};


export const initialState: State = {
    selectedWorkspaces: [],
    dimensionPresets: [],
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
    dimensionPresets: string[]
}

export function setDimensionPresets(dimensionPresets: string[]): SetDimensionPresets {
    return {
        type: 'setDimensionPresets',
        dimensionPresets
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
                draftState.dimensionPresets = action.dimensionPresets;
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
