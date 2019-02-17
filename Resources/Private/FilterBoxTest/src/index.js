import ClassicEditor from './ckeditor';

ClassicEditor
    // Note that you do not have to specify the plugin and toolbar configuration — using defaults from the build.
    .create( document.querySelector( '#editor' ) )
    .then( editor => {
        console.log( 'Editor was initialized', editor );
        editor.setData(
			'<p>foobar</p>' +
			'<div class="widget"><div class="nested">bar</div></div>' +
			'<p>foobar</p>'
)
    } )
    .catch( error => {
        console.error( error.stack );
    } );
