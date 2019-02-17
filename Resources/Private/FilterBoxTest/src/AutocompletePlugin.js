import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import {toWidget, toWidgetEditable} from '@ckeditor/ckeditor5-widget/src/utils';
import {downcastElementToElement, insertElement} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import {upcastElementToElement} from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import View from '@ckeditor/ckeditor5-ui/src/view';

import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import {addListToDropdown, createDropdown} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';


import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';
import BalloonPanelView from "@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview";

export default class AutocompletePlugin extends Plugin {
    static get requires() {
        return [];
    }

    init() {
        this._setupUi();

        this.editor.model.document.on('change', () => this._check());
    }

    /**
     * TODO
     */
    _setupUi() {
        this.listView = this._setupList();
    }

    /**
     * TODO
     */
    _setupList() {
        const editor = this.editor;

        const listView = new ListView();
        editor.ui.view.body.add(listView);

        editor.editing.view.document.on('keydown', (evt, domEvt) => {
            /*if (!listModel.isOn) {
                return;
            }*/

            const keyCode = domEvt.keyCode;

            if (keyCode === 40) {
                listView.focus();
            }

        });

        return listView;
    }

    _check() {
        console.log('[i] Checking autocomplete');

        const editor = this.editor;

        const cfg = {
            '@': ['foo', 'bar']
        }

        // A s#ample @te^xt.
        const sel = editor.model.document.selection;

        // "A s#ample @text."
        // TODO! does not fully work yet.
        const selText = sel.focus.textNode ? sel.focus.textNode.data : null;
        const selOffset = sel.focus.offset;

        this.listView.items.clear();

        if (!selText) {
            return;
        }
        const preceding = selText.substr(0, selOffset);

        let lastTrigger = null;
        let lastTriggerIndex = -1;



        for (let c in cfg) {
            const index = preceding.lastIndexOf(c);


            if (index > lastTriggerIndex) {
                // "A s#ample @te"
                // -----------^
                lastTriggerIndex = index;

                // "@"
                lastTrigger = c;
            }
        }

        console.log(`	[i] Preceding: "${preceding}"`);

        if (!lastTrigger) {
            console.log('	[i] No trigger found.');

            return;
        }

        // "text"
        const text =
            // "te"
            selText.slice(lastTriggerIndex, selOffset) +
            // "xt."
            selText.slice(selOffset).split(/\s/g)[0];

        console.log(`	[i] Text: "${text}"`);

        if (text.match(/\s/g)) {
            console.log('	[i] Whitespace between trigger and current position.');

            return;
        }


        cfg[ lastTrigger ]
            .filter( sugText => {
                return true;
                if ( text === lastTrigger ) {
                    return true;
                } else {
                    return sugText !== text && sugText.indexOf( text ) === 0;
                }

            } )
            .sort()
            .forEach( sugText => {
                console.log( `	[i] Suggestion "${ sugText }" found.` );

                const li = new AutocompleteListItem(sugText);

                // It's very, very memory-inefficient. But it's a PoC, so...
                this.listView.items.add(li);

            } );


        const selRect = document.defaultView.getSelection().getRangeAt( 0 ).getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();

        this.listView.element.style.display = 'block';
        this.listView.element.style.position = 'absolute';
        this.listView.element.style.top = selRect.bottom - bodyRect.top + 'px';
        this.listView.element.style.left = selRect.right - bodyRect.left + 'px';

    }
}

class AutocompleteListItem extends View {
    constructor(label) {
        super();

        this.setTemplate( {
            tag: 'li',
            // The FocusCycler expects a tabindex to be set.
            attributes: {
                tabindex: -1
            },

            children: [label]
        } );
    }

    /**
     * The FocusCycler expects a "focus" function to exist.
     */
    focus() {
        this.element.focus();
    }
}