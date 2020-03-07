/**
 * @module prePlugin
 */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PreCommand from './precommand';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

import {
	PRE,
	getIfInsideOfPreElement,
	checkIfInsideOfPreElement,
	modelToViewAttributeConverter,
	isPreElement,
	isParagraphElement,
	isSpanElement,
	toPreWidget,
	toPreWidgetEditable
} from './utils';
import { highlight_init } from './highlighter/highlightediting';

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
		const highlightOptions = editor.config.get( 'preCodeBlock.highlightConfig' ) || {};

		schema.register( PRE, {
			allowWhere: '$block',
	    allowContentOf: '$block',
			isBlock: true,
			isObject: true,
			allowAttributes:['class', 'data-language']
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

		conversion.for( 'downcast' ).add( modelToViewAttributeConverter( editor, ['class','data-language'] ) );

		conversion.for( 'upcast' ).elementToElement( {
			view: PRE,
			model: ( viewElement, modelWriter ) => modelWriter.createElement( PRE, viewElement.getAttributes() )
		} );

		// Create pre commands.
		editor.commands.add( PRE, new PreCommand( editor, options ) );

		if( highlightOptions && highlightOptions.highlighter ){
			highlight_init( this );
		}
	}

	afterInit() {
		const editor = this.editor;
		const mapper = editor.editing.mapper;
		const options = editor.config.get( 'preCodeBlock' );

		editor.keystrokes.set( 'Ctrl+ArrowUp', ( keyEvtData, cancel ) => {

				const preElement = getIfInsideOfPreElement(editor.model.document.selection);
				if( preElement ){
					editor.model.change( writer => {
							let previousSibling = preElement.previousSibling;
							if( !previousSibling ){
								previousSibling = writer.createElement( 'paragraph' );
								writer.insert( previousSibling, writer.createPositionBefore( preElement ) );
							}
							writer.setSelection( previousSibling, 'in' );
					} );
					cancel();
				}
		}, { priority: 'highest' } );

		editor.keystrokes.set( 'Ctrl+ArrowDown', ( keyEvtData, cancel ) => {

				const preElement = getIfInsideOfPreElement(editor.model.document.selection);
				if( preElement ){
					editor.model.change( writer => {
							let nextSibling = preElement.nextSibling;
							if( !nextSibling ){
								nextSibling = writer.createElement( 'paragraph' );
								writer.insert( nextSibling, writer.createPositionAfter( preElement ) );
							}
							writer.setSelection( nextSibling, 'in' );
					} );
					cancel();
				}
		}, { priority: 'highest' } );

		this.listenTo( editor.editing.view.document, 'enter', ( evt, data ) => {

			const selection = editor.model.document.selection;
			if( data && data.domEvent && !data.domEvent.ctrlKey && checkIfInsideOfPreElement(editor) ){
				editor.execute( 'shiftEnter');
				data.preventDefault();
				evt.stop();
			}
		}, { priority: 'highest' } );

		this.listenTo( editor.editing.view.document, 'keydown', ( evt, data ) => {

			const selection = editor.model.document.selection;
			if ( (data.keyCode == keyCodes.delete || data.keyCode == keyCodes.backspace) && checkIfInsideOfPreElement(editor) ) {

				const _element = selection.getSelectedElement()?selection.getSelectedElement():selection.getLastPosition()?selection.getLastPosition().parent:null;

				if( (isParagraphElement( _element ) && isPreElement( _element.parent ) && _element.isEmpty && _element.parent.childCount == 1) ||
					( isPreElement( _element ) && _element.childCount == 1 && isParagraphElement( _element.getChild(0) ) && _element.getChild(0).isEmpty )
				){

					editor.model.change( writer => {
					    writer.remove( isPreElement( _element ) ? _element:_element.parent );
					} );
					data.preventDefault();
					evt.stop();
				}
			}

			if ( (data.keyCode == keyCodes.tab) && checkIfInsideOfPreElement(editor) ) {

				var str = new Array( ( options&&options.noOfSpaceForTabKey?options.noOfSpaceForTabKey:4 ) + 1).join(' ');
				editor.execute( 'input', { text: str } );
				data.preventDefault();
				evt.stop();
			}

		} );


		const upWriter = new UpcastWriter();
		editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', ( evt, data ) => {

			if( data && data.content && data.content.childCount == 1 && isPreElement( data.content.getChild(0) ) && checkIfInsideOfPreElement(editor) ){

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

			return toPreWidget( viewWriter.createContainerElement( PRE, modelElement.getAttributes() ), viewWriter, editor.t( 'pre widget' ) );
		}else{

			const preWidget = toPreWidget( viewWriter.createEditableElement( PRE, modelElement.getAttributes() ), viewWriter, editor.t( 'pre editable widget' ) );
			return toPreWidgetEditable( preWidget, viewWriter, editor.t( 'pre widget' ) );
		}
	}return '';
}
