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
        <div>
            <h2>Workspace Restriction</h2>
            <MultiSelectBox
                options={props.workspaces}
                optionValueField="name"
                onValuesChange={props.onSelectedWorkspacesChanged}
                searchOptions={props.workspaces}
                values={props.selectedWorkspaces}
                placeholder="Restrict to a single workspace"
            />
        </div>
    );
});

