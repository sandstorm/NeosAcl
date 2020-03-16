import React, { useMemo } from 'react';
import MultiSelectBox from '@neos-project/react-ui-components/lib-esm/MultiSelectBox/index';
import { SelectedDimensionPreset } from '../state';

export type DimensionPreset = {
    readonly dimensionName: string;
    readonly presetName: string;
    readonly dimensionLabel: string;
    readonly presetLabel: string;
};

type DimensionPresetSelectorProps = {
    dimensionPresets: DimensionPreset[];
    selectedDimensionPresets: SelectedDimensionPreset[];
    onSelectedDimensionPresetsChanged: (newNames: SelectedDimensionPreset[]) => void;
};



const combineDimensionAndPresetName = (dimensionName: string, presetName: string) => `${dimensionName}|||${presetName}`;


export default React.memo(function DimensionPresetSelector(props: DimensionPresetSelectorProps) {

    const preparedOptions = useMemo(
        () => props.dimensionPresets.map(dimensionPreset => ({
            combinedDimensionAndPresetName: combineDimensionAndPresetName(dimensionPreset.dimensionName, dimensionPreset.presetName),
            label: `${dimensionPreset.dimensionLabel}: ${dimensionPreset.presetLabel}`
        })),
        [props.dimensionPresets]
    );

    const preparedSelectedDimensionPresets = props.selectedDimensionPresets.map(selected =>
        combineDimensionAndPresetName(selected.dimensionName, selected.presetName)
    );

    const onSelectedDimensionPresetsChanged = (newValues: string[]) =>
        props.onSelectedDimensionPresetsChanged(newValues.map(newValue => {
            const values = newValue.split("|||");
            return {
                dimensionName: values[0],
                presetName: values[1]
            }
        }))

    return (
        <div className="neos-control-group">
            <label className="neos-control-label">... in dimension</label>
            <div className="neos-controls neos-controls-row">
                <MultiSelectBox
                    options={preparedOptions}
                    optionValueField="combinedDimensionAndPresetName"
                    onValuesChange={onSelectedDimensionPresetsChanged}
                    searchOptions={preparedOptions}
                    values={preparedSelectedDimensionPresets}
                    placeholder="Restrict to dimensions"
                />
            </div>
            <div className="neos-help-block">
                Leave blank to match all dimensions.
            </div>
        </div>
    );
});

