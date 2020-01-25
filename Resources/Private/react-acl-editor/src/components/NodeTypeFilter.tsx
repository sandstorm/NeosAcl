import React, { useMemo, useState } from 'react';
import MultiSelectBox from '@neos-project/react-ui-components/lib-esm/MultiSelectBox/index';
import Dialog from '@neos-project/react-ui-components/lib-esm/Dialog/index';
import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton/index';
import Button from '@neos-project/react-ui-components/lib-esm/Button/index';

type NodeType = {
    value: string,
    label: string
}

type NodeTypeFilterProps = {
    nodeTypes: NodeType[]
};




export default React.memo(function NodeTypeFilter(props: NodeTypeFilterProps) {

    const [isOpen, setOpen] = useState(false);

    return (
        <div>
            <Dialog
                actions={[
                    <Button
                        key="apply"
                        style="lighter"
                        hoverStyle="brand"
                        onClick={() => setOpen(false)}
                    >
                        Apply
                    </Button>
                ]}
                title="Extra Filters"
                onRequestClose={() => setOpen(false)}
                isOpen={isOpen}
            >
                <div>
                    <MultiSelectBox
                        options={props.nodeTypes}
                        optionValueField="value"
                        searchOptions={props.nodeTypes}
                    />
                </div>
            </Dialog>

            <IconButton icon="filter" onClick={(e) => { setOpen(true); e.stopPropagation(); }} />
        </div>
    );
});

