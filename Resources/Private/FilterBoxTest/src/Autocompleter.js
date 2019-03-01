import ListView from "@ckeditor/ckeditor5-ui/src/list/listview";
import View from "@ckeditor/ckeditor5-ui/src/view";
import KeystrokeHandler from "@ckeditor/ckeditor5-utils/src/keystrokehandler";

const nodeIsInsideNode = (nodeName, node) => {
    if (node.name === nodeName) {
        return true;
    } else if (!node.parent) {
        return false;
    }

    return nodeIsInsideNode(nodeName, node.parent);
};

export default function createAutocomplete(editor) {
    const suggestionView = new ListView();
    editor.ui.view.body.add(suggestionView);

    focusAutocompleteSuggestionsIfOpenOnKeyDown(suggestionView, editor);

    const topLevelKeywords = [
        'isDescendantNodeOf',
        'isAncestorNodeOf',
        'isAncestorOrDescendantNodeOf',
        'nodeIsOfType',
        'createdNodeIsOfType',
        'isInWorkspace',
        'nodePropertyIsIn',
        'isInDimensionPreset'
    ];

    const nodeTypes = [
        'Neos.Neos:Foo',
        'Neos.Neos:Bar',
        'Neos.Neos:Hurz'
    ];

    const generateKeywords = (node, currentWord) => {
        if (nodeIsInsideNode('widget', node)) {
            return Promise.resolve(nodeTypes.filter(keyword =>
                keyword.toLowerCase().indexOf(currentWord.toLowerCase()) !== -1
            ));
        }

        return Promise.resolve(topLevelKeywords.filter(keyword =>
            keyword.toLowerCase().indexOf(currentWord.toLowerCase()) !== -1
        ));
    };

    editor.model.document.on('change', runAutocompleteOnDocumentChange(generateKeywords, suggestionView, editor));
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

function runAutocompleteOnDocumentChange(generateKeywords, suggestionView, editor) {
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
        const [lengthOfWordBeforeSelection, lengthOfWordAfterSelection] = lengthOfWordBeforeAndAfterSelection(textUnderSelection, selectionOffset);

        const nodeIsInsideWidget = nodeIsInsideNode('widget', node);
        generateKeywords(node, currentWord).then(keywords =>
            keywords.forEach(keyword => {
                const li = new AutocompleteListItem(keyword, () => {
                    const currentPosition = editor.model.document.selection.focus;

                    const startPosition = currentPosition.getShiftedBy(-lengthOfWordBeforeSelection);
                    const rangeOfCurrentWord = editor.model.createRange(
                        startPosition,
                        currentPosition.getShiftedBy(lengthOfWordAfterSelection)
                    );

                    editor.model.change(writer => {
                        writer.remove(rangeOfCurrentWord);
                        if (nodeIsInsideWidget) {
                            console.log("NODE INSIDE NODE");
                            editor.model.insertContent(writer.createText(keyword));
                        } else {
                            const w = writer.createElement('widget', {
                                functionName: keyword
                            });

                            const nested = writer.createElement( 'nested' );
                            writer.insert( nested, w, 0 );
                            editor.model.insertContent(w, startPosition);
                        }
                    });

                    // TODO does not seem to work?
                    // suggestionView.items.clear();
                });

                // It's very, very memory-inefficient. But it's a PoC, so...
                suggestionView.items.add(li);
            })
        );

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

export function lengthOfWordBeforeAndAfterSelection(textUnderSelection, selectionOffset) {
    const preceding = textUnderSelection.substr(0, selectionOffset);
    const following = textUnderSelection.substr(selectionOffset);

    const previousWordResult = preceding.match(EXTRACT_LAST_WORD);
    const nextWordResult = following.match(EXTRACT_FIRST_WORD);

    const lengthBeforeAndAfter = [0, 0];
    if (previousWordResult) {
        lengthBeforeAndAfter[0] = previousWordResult[0].length;
    }

    if (nextWordResult) {
        lengthBeforeAndAfter[1] = nextWordResult[0].length;
    }

    return lengthBeforeAndAfter
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
        this.keystrokes.listenTo(this.element);
    }

    /**
     * The FocusCycler expects a "focus" function to exist.
     */
    focus() {
        this.element.focus();
    }
}