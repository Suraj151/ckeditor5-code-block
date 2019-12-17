/**
 * @module embed/embedcommand
 */

import { findOptimalInsertionPosition, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import { PRE, insertPreElement, mergeElements, _checkIfPreElement } from './utils';
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
		const model = this.editor.model;
		const doc = model.document;
		let _option = _checkIfPreElement(this.editor);

		this.isEnabled = true;
		this.value = _option ? _option.title:"select language";
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
		const firstPosition = selection.getFirstPosition();
		const lastPosition = selection.getLastPosition();
		let isRoot = firstPosition.parent === firstPosition.root;
		let _language = options ? options.language:"default";
		let _isInsideOfPre = _checkIfPreElement(this.editor);

		model.change( writer => {
			let preElement = writer.createElement( PRE, {class:_language+' pre_wrap ck-widget'} );
			insertPreElement( preElement, writer, model );
		} );
	}

}
