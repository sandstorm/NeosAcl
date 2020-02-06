import {  useEffect, useState } from 'react';

export function useNodeTree(csrfProtectionToken: string, siteNode: string) {
    const [nodes, setNodes] = useState([]);
    useEffect(
        () => {

            fetch('/neos/ui-services/flow-query', {
                credentials: "same-origin",
                method: 'POST',
                headers: {
                    'X-Flow-Csrftoken': csrfProtectionToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "chain": [{ "type": "createContext", "payload": [{ "$node": siteNode }, { "$node": siteNode }] }, { "type": "neosUiDefaultNodes", "payload": ["Neos.Neos:Document", 4, [], null] }, { "type": "getForTree", "payload": "ALL" }] })
            })
                .then(response => response.json())
                .then(responseJson => {
                    setNodes(responseJson);
                });
        },
        [csrfProtectionToken, siteNode]
    );

console.log("NODES", nodes);

    return nodes;
}
