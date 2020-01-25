import React, { useMemo } from 'react';
import MultiSelectBox from '@neos-project/react-ui-components/lib-esm/MultiSelectBox/index';

export type DimensionPreset = {
    readonly contentDimensionAndPreset: string;
    readonly dimensionLabel: string;
    readonly presetLabel: string;
};

type NodeTypeFilterProps = {
};




export default React.memo(function NodeTypeFilter(props: NodeTypeFilterProps) {

    return (
        <div>
            <h2>Node Type Filter</h2>
            <MultiSelectBox
            />
        </div>
    );
});

