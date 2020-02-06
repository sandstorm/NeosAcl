import React, { useMemo, useState } from 'react';
import MultiSelectBox from '@neos-project/react-ui-components/lib-esm/MultiSelectBox/index';
import Dialog from '@neos-project/react-ui-components/lib-esm/Dialog/index';
import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton/index';
import Button from '@neos-project/react-ui-components/lib-esm/Button/index';
import style from './style.module.css';
import classnames from 'classnames';

type NodeType = {
    value: string,
    label: string
}

type NodeTypeFilterProps = {
    whitelistedNodeTypes: string[];
    onWhitelistedNodeTypesChanged: (newSelection: string[]) => void;

    nodeTypes: NodeType[];
    className?: string;
};




export default React.memo(function NodeTypeFilter(props: NodeTypeFilterProps) {

    const iconButtonClassNames = classnames({
        [style.filterIconButton]: true,
        [style['filterIconButton--active']]: props.whitelistedNodeTypes.length > 0
    });

    const [isOpen, setOpen] = useState(false);
    return (
        <div className={style.nodeTypeFilterButton} onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
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
                <div className={style.nodeTypeFilterContainer}>
                    <MultiSelectBox
                        options={props.nodeTypes}
                        optionValueField="value"
                        searchOptions={props.nodeTypes}
                        values={props.whitelistedNodeTypes}
                        onValuesChange={props.onWhitelistedNodeTypesChanged}
                        placeholder="Restrict to some NodeTypes"
                    />
                </div>
            </Dialog>

            <IconButton className={iconButtonClassNames} icon="filter" size="small" style="transparent" onClick={(e) => { setOpen(true); e.stopPropagation(); }} />
        </div>
    );
});

