import React, { useMemo } from 'react';
import MultiSelectBox from '@neos-project/react-ui-components/lib-esm/MultiSelectBox/index';

export type DimensionPreset = {
    readonly contentDimensionAndPreset: string;
    readonly dimensionLabel: string;
    readonly presetLabel: string;
};

type DimensionPresetSelectorProps = {
    dimensionPresets: DimensionPreset[];
    selectedDimensionPresets: string[];
    onSelectedDimensionPresetsChanged: (newNames: string[]) => void;
};




export default React.memo(function DimensionPresetSelector(props: DimensionPresetSelectorProps) {

    const preparedOptions = useMemo(
        () => props.dimensionPresets.map(dimensionPreset => ({
            ...dimensionPreset,
            label: `${dimensionPreset.dimensionLabel}: ${dimensionPreset.presetLabel}`
        })),
        [props.dimensionPresets]
    );

    return (
        <div>
            <h2>DimensionPreset Restriction</h2>
            <MultiSelectBox
                options={preparedOptions}
                optionValueField="contentDimensionAndPreset"
                onValuesChange={props.onSelectedDimensionPresetsChanged}
                searchOptions={preparedOptions}
                values={props.selectedDimensionPresets}
                placeholder="Restrict to a single dimensionPreset"
            />
        </div>
    );
});

