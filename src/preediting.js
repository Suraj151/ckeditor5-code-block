/**
 * @module prePlugin
 */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PreCommand from './precommand';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

import {
	PRE,
	_checkIfPreElement,
	modelToViewAttributeConverter,
	isPreElement,
	toPreWidget,
	toPreWidgetEditable,
	enableSpanElementInPre
} from './utils';

const keyCodes = {
	backspace: 8,
	delete: 46,
	tab: 9,
	// ctrl: 0x110000,
	// // Has the same code as ctrl, because their behaviour should be unified across the editor.
	// // See http://ckeditor.github.io/editor-recommendations/general-policies#ctrl-vs-cmd
	// cmd: 0x110000,
	// shift: 0x220000,
	// alt: 0x440000
};

const _upcast_with = {styles: { 'word-wrap': 'break-word'}};

export default class PreEditing extends Plugin {

	constructor( editor ) {
		super( editor );
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;
		const mapper = editor.editing.mapper;
		const options = editor.config.get( 'preCodeBlock.languages' ) || [];

		schema.register( PRE, {
			allowWhere: '$block',
	    allowContentOf: '$block',
			isBlock: true,
			isObject: true,
			allowAttributes:['class']
		} );

		schema.extend( 'paragraph', { allowIn: PRE } );
		schema.extend( '$text', { allowIn: PRE } );

		schema.on( 'checkAttribute', ( evt, args ) => {
		    const context = args[ 0 ];
		    const attributeName = args[ 1 ];

		    if ( context.endsWith( PRE+' $text' ) && (
		    	attributeName == 'bold' ||
		    	attributeName == 'italic'
		    ) ) {
		        // Prevent next listeners from being called.
		        evt.stop();
		        // Set the checkAttribute()'s return value.
		        evt.return = false;
		    }
		}, { priority: 'high' } );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: PRE,
			view: ( modelElement, viewWriter ) => createPreViewElement( modelElement, viewWriter, editor, false ),
			upcastAlso: _upcast_with
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: PRE,
			view: ( modelElement, viewWriter ) => createPreViewElement( modelElement, viewWriter, editor, true ),
			upcastAlso: _upcast_with
		} );

		conversion.for( 'downcast' ).add( modelToViewAttributeConverter( 'class' ) );

		conversion.for( 'upcast' ).elementToElement( {
			view: PRE,
			model: ( viewElement, modelWriter ) => modelWriter.createElement( PRE, { class: viewElement.getAttribute( 'class' ) } )
		} );

		// Create pre commands.
		editor.commands.add( PRE, new PreCommand( editor, options ) );

		enableSpanElementInPre(editor);
	}

	afterInit() {
		const editor = this.editor;
		const mapper = editor.editing.mapper;
		const options = editor.config.get( 'preCodeBlock' );

		this.listenTo( editor.editing.view.document, 'enter', ( evt, data ) => {
			if( _checkIfPreElement(editor) ){
				editor.execute( 'shiftEnter');
				data.preventDefault();
				evt.stop();
			}
		} );

		this.listenTo( editor.editing.view.document, 'keydown', ( evt, data ) => {
			const doc = editor.model.document;
			const position = doc.selection.getLastPosition();
			const positionParent = position.parent;

			// if ( (data.keyCode == keyCodes.delete || data.keyCode == keyCodes.backspace) ) {
			//
			// 	if( positionParent.name == PRE && positionParent.isEmpty && positionParent.childCount <= 0 ){
			//
			// 		editor.model.change( writer => {
			// 		    writer.remove( positionParent );
			// 				// writer.remove( positionParent.parent );
			// 		} );
			// 		data.preventDefault();
			// 		evt.stop();
			// 	}
			// }
			if ( (data.keyCode == keyCodes.tab) && _checkIfPreElement(editor) ) {

				var str = new Array( ( options&&options.noOfSpaceForTabKey?options.noOfSpaceForTabKey:4 ) + 1).join(' ');
				editor.execute( 'input', { text: str } );
				data.preventDefault();
				evt.stop();
			}

		} );


		const upWriter = new UpcastWriter();
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', ( evt, data ) => {

			if( data && data.content && data.content.childCount == 1 && isPreElement( data.content.getChild(0) ) && _checkIfPreElement(editor) ){

				const preElement = data.content.getChild(0);
				if( preElement.childCount )	{

					data.content = upWriter.createDocumentFragment( [
	            upWriter.createElement(
	                'p',
	                {},
	                preElement._children
	            )
	        ] );
				}
			}

		}, { priority: 'highest' } );

	}

}

function createPreViewElement( modelElement, viewWriter, editor, toWdgetEditable ) {

	if( viewWriter ){

		if( !toWdgetEditable ){

			return toPreWidget( viewWriter.createContainerElement( PRE, {class : modelElement.getAttribute("class")} ), viewWriter, editor.t( 'pre widget' ) );
		}else{

			const preWidget = toPreWidget( viewWriter.createEditableElement( PRE, {class : modelElement.getAttribute("class")} ), viewWriter, editor.t( 'pre editable widget' ) );
			return toPreWidgetEditable( preWidget, viewWriter, editor.t( 'pre widget' ) );
		}
	}return '';
}
