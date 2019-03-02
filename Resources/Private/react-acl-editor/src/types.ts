export interface Constraint {
    type: ConstraintType;
    value: string;
}
export interface NodeType {
    value: string;
    label: string;
}
export type ConstraintType = 'isDescendantNodeOf' |
    'isAncestorNodeOf' |
    'isAncestorOrDescendantNodeOf' |
    'nodeIsOfType' |
    'createdNodeIsOfType' |
    'isInWorkspace' |
    //'nodePropertyIsIn' |
    'isInDimensionPreset';
