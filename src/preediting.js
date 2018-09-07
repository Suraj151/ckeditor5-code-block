/**
 * @module prePlugin
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PreCommand from './precommand';

const PRE = "pre";

const keyCodes = {
	backspace: 8,
	delete: 46,
	// ctrl: 0x110000,
	// // Has the same code as ctrl, because their behaviour should be unified across the editor.
	// // See http://ckeditor.github.io/editor-recommendations/general-policies#ctrl-vs-cmd
	// cmd: 0x110000,
	// shift: 0x220000,
	// alt: 0x440000
};



export default class PreEditing extends Plugin {

	constructor( editor ) {
		super( editor );

		editor.config.define( 'code_languages', {
			options: [
				{ model: PRE, view: {name:PRE, classes:"nohighlight"}, title: 'default', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_c"), view: {name:PRE, classes:"c"}, title: 'c', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_cs"), view: {name:PRE, classes:"cs"}, title: 'c#', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_cpp"), view: {name:PRE, classes:"cpp"}, title: 'cpp', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_html"), view: {name:PRE, classes:"html"}, title: 'html', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_xml"), view: {name:PRE, classes:"xml"}, title: 'xml', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_css"), view: {name:PRE, classes:"css"}, title: 'css', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_javascript"), view: {name:PRE, classes:"javascript"}, title: 'javascript', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_python"), view: {name:PRE, classes:"python"}, title: 'python', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_sql"), view: {name:PRE, classes:"sql"}, title: 'sql', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_php"), view: {name:PRE, classes:"php"}, title: 'php', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_perl"), view: {name:PRE, classes:"perl"}, title: 'perl', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_ruby"), view: {name:PRE, classes:"ruby"}, title: 'ruby', upcastAlso: {styles: { 'word-wrap': 'break-word'}} },
				{ model: (PRE+"_markdown"), view: {name:PRE, classes:"markdown"}, title: 'markdown', upcastAlso: {styles: { 'word-wrap': 'break-word'}} }
			]
		} );
	}


	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const options = editor.config.get( 'code_languages.options' );

		const preElements = [];


		for ( const option of options ) {

			schema.register( option.model, {
				allowWhere: '$block',
				isBlock: true,
				isObject:true,
				allowAttributes:['class']
			} );

			schema.extend( '$text', { allowIn: option.model } );

			schema.on( 'checkAttribute', ( evt, args ) => {
			    const context = args[ 0 ];
			    const attributeName = args[ 1 ];

			    if ( context.endsWith( option.model+' $text' ) && (
			    	attributeName == 'bold' ||
			    	attributeName == 'italic'
			    ) ) {
			        // Prevent next listeners from being called.
			        evt.stop();
			        // Set the checkAttribute()'s return value.
			        evt.return = false;
			    }
			}, { priority: 'high' } );


			conversion.elementToElement( option );

			preElements.push( option );

		}

		// Create pre commands.
		editor.commands.add( PRE, new PreCommand( editor, preElements ) );

	}

	afterInit() {
		const editor = this.editor;

		// Overwrite default Enter key behavior.
		this.listenTo( editor.editing.view.document, 'enter', ( evt, data ) => {
			const doc = editor.model.document;
			const position = doc.selection.getLastPosition();
			const positionParent = position.parent;
			const options = editor.config.get( 'code_languages.options' );

			for( const option of options){
				if( positionParent.name == option.model ){
					// editor.execute( 'input', { text: "\r\n" } );
					editor.execute( 'shiftEnter');

					data.preventDefault();
					evt.stop();
					break;
				}
			}

		} );

		this.listenTo( editor.editing.view.document, 'keydown', ( evt, data ) => {
			const doc = editor.model.document;
			const position = doc.selection.getLastPosition();
			const positionParent = position.parent;
			const options = editor.config.get( 'code_languages.options' );

			if ( (data.keyCode == keyCodes.delete || data.keyCode == keyCodes.backspace) ) {

				for( const option of options){
					if( positionParent.name == option.model && positionParent.isEmpty && positionParent.childCount <= 0 ){

						editor.model.change( writer => {
						    writer.remove( positionParent );
						} );
						data.preventDefault();
						evt.stop();
						break;
					}
				}

			}

		} );


	}


}
