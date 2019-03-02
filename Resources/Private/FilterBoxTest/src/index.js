import ClassicEditor from './ckeditor';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
ClassicEditor
    // Note that you do not have to specify the plugin and toolbar configuration — using defaults from the build.
    .create( document.querySelector( '#editor' ) )
    .then( editor => {
        CKEditorInspector.attach('editor', editor);
        console.log( 'Editor was initialized', editor );
        editor.setData(
			'<p>foobar</p>' +
			'<div class="widget" data-function="myFn"><div class="nested">bar</div></div>' +
			'<p>foobar</p>'
)
    } )
    .catch( error => {
        console.error( error.stack );
    } );
