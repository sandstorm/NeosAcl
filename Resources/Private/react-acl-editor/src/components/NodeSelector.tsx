import React, { Component } from 'react';
import AsyncSelect from 'react-select/async'

const loaderFactory = (nodeSearchEndpoint: string) => (inputValue: string) => {
    console.log("LOADER", nodeSearchEndpoint, inputValue);
    const url = new URL(nodeSearchEndpoint);

    const params = {searchTerm: inputValue};

    url.search = new URLSearchParams(params).toString();

    return fetch(url, {
        method: 'GET',
        credentials: 'include'
    })
        .then(result => result.text())
        .then(result => {
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
        .then(nodes => {
            return nodes.map(node => ({
                label: node.label,
                value: node.identifier
            }))
        });
};

export default function NodeSelector(props: { value: string, nodeSearchEndpoint: string, onParameterChange: (value: string) => void }) {
    // TODO: load "label" here
    const def = {value: props.value, label: "foo"};
    return <div>
        <AsyncSelect value={def} loadOptions={loaderFactory(props.nodeSearchEndpoint)} onChange={(value) => {
            if (Array.isArray(value)) {
                throw new Error("Unexpected type passed to ReactSelect onChange handler");
            }
            if (value && value.value) {
                props.onParameterChange(value.value);
            } else {
                props.onParameterChange("");
            }
        }} placeholder="Choose Node to add" />

    </div>
}
