import {extractCurrentWord} from './Autocompleter';

test('extractCurrentWord works', () => {
    expect(extractCurrentWord("This is a short sentence", 0)).toBe("This");
});