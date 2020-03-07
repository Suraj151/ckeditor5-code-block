export function highlight_init( that ){

  const editor = that.editor;
  const schema = editor.model.schema;
	const conversion = editor.conversion;
  const options = editor.config.get( 'preCodeBlock' );

	schema.register( 'span', {
			inheritAllFrom: '$text',
			allowIn: ['pre','span','paragraph'],
      isLimit: true,
			isInline: true,
			allowAttributes: [ 'class' ]
	} );

  schema.extend( '$text', { allowIn: 'span' } );

	conversion.for( 'downcast' ).elementToElement( {
		model: 'span',
		view: ( modelElement, viewWriter ) => {
			return viewWriter.createEditableElement( 'span', modelElement.getAttributes() )
		}
	} );

	conversion.for( 'upcast' ).elementToElement( {
		view: 'span',
		model: ( viewElement, modelWriter ) => {
			return modelWriter.createElement( 'span', viewElement.getAttributes() );
		}
	} );
}
