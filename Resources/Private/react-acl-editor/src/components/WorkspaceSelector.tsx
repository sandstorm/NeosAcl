import React, { Component, useEffect, useState, useMemo } from 'react';
import MultiSelectBox from '@neos-project/react-ui-components/lib-esm/MultiSelectBox/index';
import { produceWithPatches } from 'immer';

export type Workspace = {
    readonly name: string;
    readonly label: string;
};

type WorkspaceSelectorProps = {
    workspaces: Workspace[];
};




export default React.memo(function WorkspaceSelector(props: WorkspaceSelectorProps) {
    const [selectedWorkspace, setSelectedWorkspace] = useState([]);

    console.log("WS", props.workspaces);
    return (
        <div>
            <h2>Workspace Restriction</h2>
            <MultiSelectBox
                options={props.workspaces}
                optionValueField="name"
                onValuesChange={(newValues: any) => {console.log("NEWNV", newValues); setSelectedWorkspace(newValues)}}
                searchOptions={props.workspaces}
                values={selectedWorkspace}
                placeholder="Restrict to a single workspace"
            />
        </div>
    );
});

