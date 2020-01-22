import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PermissionWidget from './PermissionWidget';
import retargetEvents from './utility/forked-react-shadow-dom-retarget-events';
import root from 'react-shadow';
// We need to import Icon here, so that we can UNDO the config change to fontawesome-svg-core which happened in "Icon".
import Icon from '@neos-project/react-ui-components/lib-esm/Icon/index';
import style from './style.css';
import { config, IconPrefix } from '@fortawesome/fontawesome-svg-core';
config.familyPrefix = 'fa' as IconPrefix;
config.replacementClass = 'svg-inline--fa';

Array.prototype.forEach.call(document.querySelectorAll(".dynamic-editor"), (element: HTMLElement) => {

    /*const shadowRoot = element.attachShadow({ mode: 'open' });
    const mountPoint = document.createElement('div');
    shadowRoot.appendChild(mountPoint);*/
    const props = JSON.parse(element.getAttribute('data-props') || '{}');

    // see https://github.com/facebook/react/issues/9242#issuecomment-543117675
    /*Object.defineProperty(mountPoint, "ownerDocument", { value: shadowRoot });
    shadowRoot.createElement = (...args) => document.createElement(...args);
    shadowRoot.createElementNS = (...args) => document.createElementNS(...args);
    shadowRoot.createTextNode = (...args) => document.createTextNode(...args);*/

    ReactDOM.render(<div className={style.wrapper}>
        <link rel="stylesheet" href={props.cssFilePath} />
        <PermissionWidget {...props} />
    </div>, element);

    //retargetEvents(shadowRoot);
});

