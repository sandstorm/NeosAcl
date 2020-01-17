import React, { Component, useEffect, useState, useMemo } from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree/index';

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
    nodes: Node[];
    rootNodeContextPath: string;
};



type SlimNodeProps = {
    nodes: Node[];
    node: Node;
    level: number;
};

function isNode(n: Node | undefined): n is Node {
    return n !== undefined;
}

const SlimNode = React.memo(function (props: SlimNodeProps) {
    const childNodes = useMemo(() => {
        return props.node.children
            .map(childReference =>
                props.nodes.find(node => node.contextPath === childReference.contextPath)
            )
            .filter(isNode);
    }, [props.nodes, props.node]);

    return (
        <Tree.Node>
            <Tree.Node.Header level={props.level} label={props.node.label} title={props.node.nodeType} isCollapsed={false} icon="file-o" hasChildren={childNodes.length > 0} />
            {childNodes.length === 0 ?
                null
                :
                    <Tree.Node.Contents>
                        {childNodes.map(childNode => <SlimNode nodes={props.nodes} node={childNode} level={props.level + 1} />)}
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
        <Tree>
            <SlimNode nodes={props.nodes} node={rootNode} level={1} />
        </Tree>
    );
});

