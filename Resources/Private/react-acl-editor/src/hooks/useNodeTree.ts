import { useEffect, useState, useCallback } from 'react';
import { Node } from '../types';

export function useNodeTree(csrfProtectionToken: string, siteNode: string, expandedNodes: string[], nodeTreeLoadingDepth: number) {
    const [nodes, setNodes] = useState<Node[]>([]);
    useEffect(
        () => {

            fetch('/neos/ui-services/flow-query', {
                credentials: "same-origin",
                method: 'POST',
                headers: {
                    'X-Flow-Csrftoken': csrfProtectionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "chain": [{ "type": "createContext", "payload": [{ "$node": siteNode }, { "$node": siteNode }] }, { "type": "neosUiDefaultNodes", "payload": ["Neos.Neos:Document", nodeTreeLoadingDepth, expandedNodes, []] }, { "type": "getForTree", "payload": "ALL" }] })
            })
                .then(response => response.json())
                .then(responseJson => {
                    setNodes(responseJson);
                });
        },
        [csrfProtectionToken, siteNode, expandedNodes, nodeTreeLoadingDepth]
    );




    const loadAdditionalNodes = useCallback((parentNodeToLoadChildrenFor: string) => {
        fetch('/neos/ui-services/flow-query', {
            credentials: "same-origin",
            method: 'POST',
            headers: {
                'X-Flow-Csrftoken': csrfProtectionToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "chain": [{ "type": "createContext", "payload": [{ "$node": parentNodeToLoadChildrenFor }] }, { "type": "neosUiFilteredChildren", "payload": ["Neos.Neos:Document"] }, { "type": "getForTree", "payload": "ALL" }] })
        })
            .then(response => response.json())
            .then(responseJson => {
                console.log("NODES", nodes, responseJson);
                setNodes([...nodes, ...responseJson]);
            });
    }, [nodes, csrfProtectionToken, siteNode]);

    return {
        nodes,
        loadAdditionalNodes
    };
}
