/**
 * @module prePlugin
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PreCommand from './precommand';

const PRE = "pre";

export default class PreEditing extends Plugin {
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		schema.register( PRE, {
			allowWhere: '$block',
			isBlock: true
		} );

		schema.extend( '$text', { allowIn: PRE } );

		conversion.elementToElement( {
			model: PRE,
			view: PRE,
			upcastAlso: {
				styles: {
					'word-wrap': 'break-word'
				}
			}
		} );

		// Create pre commands.
		editor.commands.add( PRE, new PreCommand( editor ) );

	}

	afterInit() {
		const editor = this.editor;

		// Overwrite default Enter key behavior.
		this.listenTo( this.editor.editing.view.document, 'enter', ( evt, data ) => {
			const doc = this.editor.model.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if(positionParent.name == PRE){
				editor.execute( 'input', { text: "\r\n" } );
				data.preventDefault();
				evt.stop();
			}

		} );
	}


}
