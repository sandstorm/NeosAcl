import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PermissionWidget from './PermissionWidget';


Array.prototype.forEach.call(document.querySelectorAll(".dynamic-editor"), (element: HTMLElement) => {
    element.style.display = "none";
    element.setAttribute("disabled", "disabled");
    const props = JSON.parse(element.getAttribute('data-props') || '{}');
    const name = element.getAttribute('name') || '';
    const value = element.getAttribute('value') || '';
    const wrapper = document.createElement('div');
    if (element.parentNode) {
        element.parentNode.insertBefore(wrapper, element.nextSibling);
        ReactDOM.render(<PermissionWidget {...props} name={name} value={value}/>, wrapper);
    }
});

