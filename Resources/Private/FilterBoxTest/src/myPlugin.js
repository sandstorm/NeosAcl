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


class SampleInputView extends View {
    constructor(editor, modelItem, locale) {
        super(locale);

        // An entry point to binding observables with DOM attributes,
        // events and text nodes.
        const bind = this.bindTemplate;

        // Views define their interface (state) using observable properties.
        this.set({
            isEnabled: false,
            placeholder: ''
        });


        // The default dropdown.
        const dropdownView = createDropdown(locale);

        // The collection of the list items.
        const items = new Collection();

        items.add({
            type: 'button',
            model: new Model({
                withText: true,
                label: 'Foo',
                myId: "Internal-iD2"
            })
        });

        items.add({
            type: 'button',
            model: new Model({
                withText: true,
                label: 'Bar',
                myId: "Internal-iD"
            })
        });

        // Create a dropdown with a list inside the panel.
        addListToDropdown(dropdownView, items);

        dropdownView.on('execute', (event) => {
            // TODO: use "downcastAttributeToAttribute" or so? https://github.com/ckeditor/ckeditor5-engine/blob/69dcab556fce0ce2ca7a6e6cd2f926cd7c971031/src/conversion/downcast-converters.js#L158-L211
            dropdownView.buttonView.label = event.source.label;

            editor.model.change(writer => {
                writer.setAttribute('functionName', event.source.label, modelItem);
            });
        });

        dropdownView.buttonView.withText = true;
        dropdownView.buttonView.label = modelItem.getAttribute('functionName');

        this.setTemplate({
            tag: 'div',
            children: [
                dropdownView
            ],
            attributes: {
                class: [
                    'foo',
                    // The value of view#isEnabled will control the presence
                    // of the class.
                    bind.if('isEnabled', 'ck-enabled'),
                ],

                // The HTML "placeholder" attribute is also controlled by the observable.
                placeholder: bind.to('placeholder'),
                type: 'text'
            },
            on: {
                // DOM keydown events will fire the view#input event.
                keydown: bind.to('input')
            }
        });
    }

    setValue(newValue) {
        this.element.value = newValue;
    }
}


export default class MyPlugin extends Plugin {
    static get requires() {
        return [Widget];
    }

    init() {
        this.editor.conversion.elementToElement({model: 'paragraph', view: 'span', converterPriority: 'high'});
        console.log("this.editor", this.editor);

        /*this.editor.editing.downcastDispatcher.on('insert', ( evt, data, conversionApi ) => {
            console.log("INSERT", evt, data, conversionApi);
        });*/
        console.log('InsertImage2 was initialized');

        const model = this.editor.model;

        model.schema.register('widget', {
            inheritAllFrom: '$block',
            allowAttributes: ['functionName'],
            isObject: true
        });

        model.schema.extend('$text', {
            allowIn: 'nested'
        });

        model.schema.register('nested', {
            allowIn: 'widget',
            isLimit: true
        });

        this.editor.conversion.for('dataDowncast')
            .add(downcastElementToElement({
                model: 'widget',
                view: (modelItem, writer) => {
                    return writer.createContainerElement('div', {class: 'widget'});
                }
            }))
            .add(downcastElementToElement({
                model: 'nested',
                view: (modelItem, writer) => {
                    return writer.createContainerElement('div', {class: 'nested'});
                }
            }));

        const editor = this.editor;
        this.editor.conversion.for('editingDowncast')
            .add(dispatcher => {
                const insertViewElement = insertElement(
                    (modelItem, writer) => {
                        const div = writer.createContainerElement('div', {class: 'widget'});
                        const x2 = writer.createUIElement('div', null, function (domDocument) {
                            const domElement = this.toDomElement(domDocument);

                            // HINT: we are rendering a view here inside a Widget :)
                            const view = new SampleInputView(editor, modelItem);
                            view.render();

                            domElement.appendChild(view.element);
                            view.isEnabled = true;

                            return domElement;
                        });

                        writer.insert(writer.createPositionAt(div, 0), x2);

                        const viewSlot = writer.createContainerElement('div', {class: 'slot'});
                        writer.insert(writer.createPositionAt(div, 1), viewSlot);

                        const x3 = writer.createUIElement('div', null, function (domDocument) {
                            const domElement = this.toDomElement(domDocument);

                            domElement.innerHTML = "After";
                            return domElement;
                        });

                        writer.insert(writer.createPositionAt(div, 2), x3);

                        return toWidget(div, writer, {label: 'widget label'});
                    });

                dispatcher.on('insert:widget', (evt, data, conversionApi) => {
                    insertViewElement(evt, data, conversionApi);

                    // Use the existing "old" mapping created by `insertViewElement()`.
                    const viewContainer = conversionApi.mapper.toViewElement(data.item);
                    const viewSlot = viewContainer.getChild(1);

                    conversionApi.mapper.bindElements(data.item, viewSlot);
                });
            })
            .add(downcastElementToElement({
                model: 'nested',
                view: (modelItem, writer) => {
                    // const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
                    const nested = writer.createEditableElement('div', {class: 'nested'});

                    return toWidgetEditable(nested, writer);
                }
            }));


        this.editor.conversion.for('upcast')
            .add(upcastElementToElement({
                view: {
                    name: 'div',
                    class: 'widget'
                },
                model: (viewElement, modelWriter) => {
                    return modelWriter.createElement('widget', {functionName: viewElement.getAttribute('data-function')});
                }
            }))
            .add(upcastElementToElement({
                view: {
                    name: 'div',
                    class: 'nested'
                },
                model: 'nested'
            }));

        ;
    }
}
