import React, { Component, useEffect, useState, useMemo } from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree/index';
import CheckBox from '@neos-project/react-ui-components/lib-esm/Checkbox/index';
import NodeTypeFilter from './NodeTypeFilter';
import { Node, NodeChildrenReference, NodeType } from '../types';
import { SelectedNodes, toggleNodeSelection, updateWhitelistedNodeTypesForNode } from '../state';
import style from './style.module.css';
import classnames from 'classnames';

type SlimNodeTreeProps = {
    nodeTypes: NodeType[];
    nodes: Node[];
    loadAdditionalNodes: (parentNodePath: string) => void;

    rootNodeContextPath: string;

    selectedNodes: SelectedNodes;
    dispatch: (action: any) => void;
};



type SlimNodeProps = {
    nodeTypes: NodeType[];
    nodes: Node[];
    loadAdditionalNodes: (parentNodePath: string) => void;

    node: Node;
    level: number;

    selectedNodes: SelectedNodes;
    parentIsSelected: boolean;
    dispatch: (action: any) => void;
};

function isNode(n: Node | undefined): n is Node {
    return n !== undefined;
}

const isDocumentNode = (nodeTypes: NodeType[]) => (n: NodeChildrenReference) => {
    const nodeType = nodeTypes.find(nt => nt.value === n.nodeType);

    return nodeType?.isDocumentNode;
};


const SlimNode = React.memo(function (props: SlimNodeProps) {
    const { nodeTypes, node, dispatch } = props;
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

    const [isCollapsed, setCollapsed] = useState(childNodes.length === 0);

    const checkBoxClassNames =  classnames({
        [style['checkbox--someParentNodeIsSelected']]: !isChecked && props.parentIsSelected,
    })

    const label = (
        <>
            <CheckBox isChecked={isChecked} className={checkBoxClassNames} /> {node.label}
            {isChecked ? <NodeTypeFilter nodeTypes={nodeTypes} whitelistedNodeTypes={whitelistedNodeTypes} onWhitelistedNodeTypesChanged={(newNodeTypes) => dispatch(updateWhitelistedNodeTypesForNode(node.identifier, newNodeTypes))} /> : null}
        </>
    );

    const hasChildren = (props.node.children.filter(isDocumentNode(nodeTypes)).length > 0);

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isChecked}

                level={props.level}
                label={label}
                title={node.nodeType}
                isCollapsed={isCollapsed}
                icon="file-o"
                hasChildren={hasChildren}
                onToggle={() => {
                    if (isCollapsed && hasChildren && !childNodes.length) {
                        // we want to get expanded (are collapsed currently); we have children but they are not yet loaded
                        // -> now, we want to load children.
                        props.loadAdditionalNodes(node.contextPath);
                    }
                    setCollapsed(!isCollapsed);
                }}
                onClick={() => dispatch(toggleNodeSelection(node.identifier))}
            />
            {isCollapsed || childNodes.length === 0 ?
                null
                :
                <Tree.Node.Contents>
                    {childNodes.map(childNode => <SlimNode key={childNode.identifier} nodes={props.nodes} loadAdditionalNodes={props.loadAdditionalNodes} node={childNode} level={props.level + 1} nodeTypes={props.nodeTypes} dispatch={props.dispatch} selectedNodes={props.selectedNodes} parentIsSelected={props.parentIsSelected || isChecked} />)}
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
        <div className="neos-control-group">
            <label className="neos-control-label">... in document tree</label>
            <div className="neos-controls neos-controls-row">
                <Tree className={style.slimNodeTree}>
                    <SlimNode nodes={props.nodes} loadAdditionalNodes={props.loadAdditionalNodes} node={rootNode} level={1} nodeTypes={props.nodeTypes} dispatch={props.dispatch} selectedNodes={props.selectedNodes} parentIsSelected={false} />
                </Tree>
            </div>
        </div>
    );
});

