import React, { Component, useEffect, useState, useMemo } from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree/index';
import CheckBox from '@neos-project/react-ui-components/lib-esm/Checkbox/index';
import NodeTypeFilter from './NodeTypeFilter';
import { NodeType } from '../types';
import { SelectedNodes, toggleNodeSelection, updateWhitelistedNodeTypesForNode } from '../state';
import style from './style.module.css';

type NodeChildrenReference = {
    readonly contextPath: string;
    readonly nodeType: string;
};

type Node = {
    readonly contextPath: string;
    readonly name: string;
    readonly identifier: string;
    readonly label: string;
    readonly nodeType: string;
    readonly children: NodeChildrenReference[];
};

type SlimNodeTreeProps = {
    nodeTypes: NodeType[];
    nodes: Node[];
    rootNodeContextPath: string;

    selectedNodes: SelectedNodes;
    dispatch: (action: any) => void;
};



type SlimNodeProps = {
    nodeTypes: NodeType[];
    nodes: Node[];
    node: Node;
    level: number;

    selectedNodes: SelectedNodes;
    dispatch: (action: any) => void;
};

function isNode(n: Node | undefined): n is Node {
    return n !== undefined;
}

const SlimNode = React.memo(function (props: SlimNodeProps) {
    const {node, dispatch} = props;
    const childNodes = useMemo(() => {
        return props.node.children
            .map(childReference =>
                props.nodes.find(node => node.contextPath === childReference.contextPath)
            )
            .filter(isNode);
    }, [props.nodes, props.node]);

    const selectedNode = props.selectedNodes[node.identifier];
    const isChecked = !!selectedNode;
    const whitelistedNodeTypes = selectedNode ? selectedNode.whitelistedNodeTypes : [];

    const [isCollapsed, setCollapsed] = useState(false);

    const label = (
        <>
            <CheckBox isChecked={isChecked} /> {node.label}
            {isChecked ? <NodeTypeFilter nodeTypes={props.nodeTypes} whitelistedNodeTypes={whitelistedNodeTypes} onWhitelistedNodeTypesChanged={(newNodeTypes) => dispatch(updateWhitelistedNodeTypesForNode(node.identifier, newNodeTypes))} /> : null}
        </>
    );

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isChecked}

                level={props.level}
                label={label}
                title={node.nodeType}
                isCollapsed={isCollapsed}
                icon="file-o"
                hasChildren={childNodes.length > 0}
                onToggle={() => setCollapsed(!isCollapsed)}
                onClick={() => dispatch(toggleNodeSelection(node.identifier))}
            />
            {isCollapsed || childNodes.length === 0 ?
                null
                :
                <Tree.Node.Contents>
                    {childNodes.map(childNode => <SlimNode nodes={props.nodes} node={childNode} level={props.level + 1} nodeTypes={props.nodeTypes} dispatch={props.dispatch} selectedNodes={props.selectedNodes}  />)}
                </Tree.Node.Contents>
            }

        </Tree.Node>
    );
});


export default React.memo(function SlimNodeTree(props: SlimNodeTreeProps) {
    const rootNode = useMemo(() => {
        return props.nodes.find(node => node.contextPath === props.rootNodeContextPath)
    }, [props.nodes, props.rootNodeContextPath]);

    if (!rootNode) {
        return <div>Loading...</div>;
    }

    return (
        <>
        <Tree className={style.slimNodeTree}>
            <SlimNode nodes={props.nodes} node={rootNode} level={1} nodeTypes={props.nodeTypes} dispatch={props.dispatch} selectedNodes={props.selectedNodes} />
        </Tree>
        </>
    );
});

