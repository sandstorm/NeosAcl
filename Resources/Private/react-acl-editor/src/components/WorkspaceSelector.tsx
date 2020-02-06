import React from 'react';
import MultiSelectBox from '@neos-project/react-ui-components/lib-esm/MultiSelectBox/index';

export type Workspace = {
    readonly name: string;
    readonly label: string;
};

type WorkspaceSelectorProps = {
    workspaces: Workspace[];
    selectedWorkspaces: string[];
    onSelectedWorkspacesChanged: (newNames: string[]) => void;
};




export default React.memo(function WorkspaceSelector(props: WorkspaceSelectorProps) {
    return (
        <div className="neos-control-group">
            <label className="neos-control-label">... in workspace</label>
            <div className="neos-controls neos-controls-row">
                <MultiSelectBox
                    options={props.workspaces}
                    optionValueField="name"
                    onValuesChange={props.onSelectedWorkspacesChanged}
                    searchOptions={props.workspaces}
                    values={props.selectedWorkspaces}
                    placeholder="Restrict to workspaces"
                />
            </div>
            <div className="neos-help-block">
                Leave blank to match all workspaces.
            </div>
        </div>
    );
});

