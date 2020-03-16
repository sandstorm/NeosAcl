
export interface NodeType {
    value: string;
    label: string;
    isDocumentNode: boolean;
}
export type NodeChildrenReference = {
    readonly contextPath: string;
    readonly nodeType: string;
};

export type Node = {
    readonly contextPath: string;
    readonly name: string;
    readonly identifier: string;
    readonly label: string;
    readonly nodeType: string;
    readonly children: NodeChildrenReference[];
};
