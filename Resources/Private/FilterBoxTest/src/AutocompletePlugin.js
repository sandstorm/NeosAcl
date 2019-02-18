import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import createAutocompleter from './Autocompleter';

export default class AutocompletePlugin extends Plugin {
    init() {
        createAutocompleter(this.editor);
    }
}
