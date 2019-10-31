import React, {Component, useEffect, useState} from 'react';
import AsyncSelect from 'react-select/async';
import {selectStyles} from "./helpers";
import Select from "react-select";

type NodeSearchEndpointParams = {
    searchTerm?: string,
    nodeIdentifier?: string
}

type Node = {
    label: string,
    identifier: string,
    nodeType: string,
    uri: string
};

function fetchNodeSearchEndpoint(nodeSearchEndpoint: string, params: NodeSearchEndpointParams): Promise<Node[]> {
    const url = new URL(nodeSearchEndpoint);
    let convertedParams = [];
    if (params.searchTerm) {
        convertedParams.push(['searchTerm', params.searchTerm]);
    }
    if (params.nodeIdentifier) {
        convertedParams.push(['nodeIdentifiers[0]', params.nodeIdentifier]);
    }
    url.search = new URLSearchParams(convertedParams).toString();

    return fetch(url, {
        method: 'GET',
        credentials: 'include'
    })
        .then(result => result.text())
        .then((result: string): Node[] => {
            const d = document.createElement('div');
            d.innerHTML = result;
            const nodes = Array.from(d.querySelectorAll('.nodes .node'));

            return nodes.map(node => {
                const uriElement = node.querySelector('.node-frontend-uri') as HTMLElement | null;
                if (!uriElement) {
                    throw new Error('.node-frontend-uri not found in result');
                }
                const nodeIdentifier = node.querySelector('.node-identifier') as HTMLElement | null;
                if (!nodeIdentifier) {
                    throw new Error('.node-identifier not found in result');
                }
                const nodeLabel = node.querySelector('.node-label') as HTMLElement | null;
                if (!nodeLabel) {
                    throw new Error('.node-label not found in result');
                }
                const nodeType = node.querySelector('.node-type') as HTMLElement | null;
                if (!nodeType) {
                    throw new Error('.node-type not found in result');
                }
                const uri = uriElement.innerText.trim();
                return {
                    loaderUri: 'node://' + nodeIdentifier.innerText,
                    label: nodeLabel.innerText,
                    identifier: nodeIdentifier.innerText,
                    nodeType: nodeType.innerText,
                    uri
                };
            });
        })
}

const loaderFactory = (nodeSearchEndpoint: string) => (inputValue: string) => {
        return fetchNodeSearchEndpoint(nodeSearchEndpoint, {
            searchTerm: inputValue
        }).then(nodes => {
            return nodes.map(node => ({
                label: node.label,
                value: node.identifier
            }))
        });
};

type InitiallySelectedNode = {label: string, value: string|null};

const useLoadInitiallySelectedNode = (nodeIdentifier: string, nodeSearchEndpoint: string): InitiallySelectedNode => {
    const [node, setNode] = useState<InitiallySelectedNode>({value: null, label: 'Loading node ' + nodeIdentifier});
    useEffect(() => {
        fetchNodeSearchEndpoint(nodeSearchEndpoint, {
            nodeIdentifier: nodeIdentifier
        }).then(nodes => {
            if (nodes.length >= 1) {
                setNode({
                    label: nodes[0].label,
                    value: nodes[0].identifier,
                });
            } else {
                setNode({
                    label: 'Did not find node ' + nodeIdentifier,
                    value: nodeIdentifier,
                });
            }
        });
    }, [nodeIdentifier, nodeSearchEndpoint]);

    return node;
};

export default function NodeSelector(props: { value?: string, nodeSearchEndpoint: string, onParameterChange: (value: string) => void }) {
    const initialValue = props.value ? useLoadInitiallySelectedNode(props.value, props.nodeSearchEndpoint) : null;
    return <span style={{display: 'inline-block', width: 400}}>
        <AsyncSelect styles={selectStyles} value={initialValue} loadOptions={loaderFactory(props.nodeSearchEndpoint)} onChange={(value) => {
            if (Array.isArray(value)) {
                throw new Error("Unexpected type passed to ReactSelect onChange handler");
            }
            if (value && value.value) {
                props.onParameterChange(value.value);
            } else {
                props.onParameterChange("");
            }
        }} placeholder="Choose Node to add" />

    </span>
}
