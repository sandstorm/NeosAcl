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
        <div className="neos-control-group">
            <label className="neos-control-label">... in dimension</label>
            <div className="neos-controls neos-controls-row">
                <MultiSelectBox
                    options={preparedOptions}
                    optionValueField="contentDimensionAndPreset"
                    onValuesChange={props.onSelectedDimensionPresetsChanged}
                    searchOptions={preparedOptions}
                    values={props.selectedDimensionPresets}
                    placeholder="Restrict to dimensions"
                />
            </div>
            <div className="neos-help-block">
                Leave blank to match all dimensions.
            </div>
        </div>
    );
});

