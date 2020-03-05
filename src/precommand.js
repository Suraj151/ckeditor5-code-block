/**
 * @module embed/embedcommand
 */

import { findOptimalInsertionPosition, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import { PRE, insertPreElement, mergeElements, checkIfInsideOfPreElement, getDataLanguageFromClass } from './utils';
/**
 * The pre plugin command.
 *
 * @extends module:core/command~Command
 */


export default class PreCommand extends Command {

	constructor( editor, options ) {
		super( editor );

		this.language_options = options;
	}


	refresh() {
		const editor = this.editor;

		this.isEnabled = true;
		this.value = checkIfInsideOfPreElement(editor);
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {String} link to embed
	 */
	execute( options ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		let _language = options&&options.language?options.language:"auto";

		model.change( writer => {
			let preElement = writer.createElement( PRE, {
				'class':_language+' ck-widget',
				'data-language': getDataLanguageFromClass(this.editor,_language)
			} );
			insertPreElement( preElement, writer, model );
		} );
	}

}
