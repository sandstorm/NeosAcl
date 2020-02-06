import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PermissionWidget from './PermissionWidget';
// We need to import Icon here, so that we can UNDO the config change to fontawesome-svg-core which happened in "Icon".
import Icon from '@neos-project/react-ui-components/lib-esm/Icon/index';
import style from './style.css';
import { config, IconPrefix } from '@fortawesome/fontawesome-svg-core';
config.familyPrefix = 'fa' as IconPrefix;
config.replacementClass = 'svg-inline--fa';

Array.prototype.forEach.call(document.querySelectorAll(".dynamic-editor"), (element: HTMLElement) => {

    const props = JSON.parse(element.getAttribute('data-props') || '{}');
    props.name = element.querySelector('input[type=hidden]')?.getAttribute('name');

    const value = element.querySelector('input[type=hidden]')?.getAttribute('value');
    if (value) {
        props.initialState = JSON.parse(value);
        if (props.initialState?.length === 0) {
            props.initialState = null;
        } else if (!props.initialState.selectedNodes || props.initialState.selectedNodes?.length === 0) {
            props.initialState.selectedNodes = {};
        }
    }

    ReactDOM.render(<div className={style.wrapper}>
        <link rel="stylesheet" href={props.cssFilePath} />
        <PermissionWidget {...props} />
    </div>, element);
});

