import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PermissionWidget from './PermissionWidget';


Array.prototype.forEach.call(document.querySelectorAll(".dynamic-editor"), (element: HTMLElement) => {

    element.style.display = "none";
    const wrapper = document.createElement('div');
    if (element.parentNode) {
        element.parentNode.insertBefore(wrapper, element.nextSibling);
        ReactDOM.render(<PermissionWidget />, wrapper);
    }
});

