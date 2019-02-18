import ListView from "@ckeditor/ckeditor5-ui/src/list/listview";
import View from "@ckeditor/ckeditor5-ui/src/view";
import KeystrokeHandler from "@ckeditor/ckeditor5-utils/src/keystrokehandler";

export default function createAutocomplete(editor) {
    const suggestionView = new ListView();
    editor.ui.view.body.add(suggestionView);

    focusAutocompleteSuggestionsIfOpenOnKeyDown(suggestionView, editor);
    editor.model.document.on('change', runAutocompleteOnDocumentChange({
        'isDescendantNodeOf': {},
        'isAncestorNodeOf': {},
        'isAncestorOrDescendantNodeOf': {},
        'nodeIsOfType': {},
        'createdNodeIsOfType': {},
        'isInWorkspace': {},
        'nodePropertyIsIn': {},
        'isInDimensionPreset': {},
    }, suggestionView, editor));
}

function focusAutocompleteSuggestionsIfOpenOnKeyDown(suggestionView, editor) {
    editor.editing.view.document.on('keydown', (evt, domEvt) => {
        // TODO enable condition
        /*if (!listModel.isOn) {
            return;
        }*/

        const keyCode = domEvt.keyCode;

        if (keyCode === 40) {
            suggestionView.focus();
        }
    });
}

function runAutocompleteOnDocumentChange(keywords, suggestionView, editor) {
    return () => {
        // A s#ample @te^xt.
        const selection = editor.model.document.selection;

        // "A s#ample @text."
        const node = selection.focus.isAtEnd
            ? selection.focus.nodeBefore
            : selection.focus.textNode;
        const textUnderSelection = node && node.data ? node.data : null;
        const selectionOffset = selection.focus.offset;

        suggestionView.items.clear();

        if (!textUnderSelection) {
            return;
        }

        const currentWord = extractCurrentWord(textUnderSelection, selectionOffset);

        console.log("CW", currentWord);

        Object.entries(keywords).filter(([keyword, _]) =>
            keyword.toLowerCase().indexOf(currentWord.toLowerCase()) !== -1
        ).forEach(([keyword, _]) => {
            const li = new AutocompleteListItem(keyword, () => {
                

                console.log("ON ACTIVATE", keyword);
            });

            // It's very, very memory-inefficient. But it's a PoC, so...
            suggestionView.items.add(li);
        });

        const selRect = document.defaultView.getSelection().getRangeAt(0).getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();

        suggestionView.element.style.display = 'block';
        suggestionView.element.style.position = 'absolute';
        suggestionView.element.style.top = selRect.bottom - bodyRect.top + 'px';
        suggestionView.element.style.left = selRect.right - bodyRect.left + 'px';
    }
}

const EXTRACT_LAST_WORD = /[a-zA-Z0-9_:.-]*$/g;
const EXTRACT_FIRST_WORD = /^[a-zA-Z0-9_:.-]*/g;

export function extractCurrentWord(textUnderSelection, selectionOffset) {
    const preceding = textUnderSelection.substr(0, selectionOffset);
    const following = textUnderSelection.substr(selectionOffset);

    console.log(preceding, following);

    const previousWordResult = preceding.match(EXTRACT_LAST_WORD);
    const nextWordResult = following.match(EXTRACT_FIRST_WORD);

    let word = '';
    if (previousWordResult) {
        word += previousWordResult[0];
    }

    if (nextWordResult) {
        word += nextWordResult[0];
    }

    return word;
}


class AutocompleteListItem extends View {
    constructor(label, onActivateFn) {
        super();

        this.keystrokes = new KeystrokeHandler();
        this.keystrokes.set('enter', () => {
            onActivateFn();
        });

        this.setTemplate({
            tag: 'li',
            // The FocusCycler expects a tabindex to be set.
            attributes: {
                tabindex: -1
            },

            children: [label]
        });
    }

    render() {
        super.render();
        this.keystrokes.listenTo( this.element );
    }

    /**
     * The FocusCycler expects a "focus" function to exist.
     */
    focus() {
        this.element.focus();
    }
}