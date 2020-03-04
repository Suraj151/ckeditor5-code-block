import Command from '@ckeditor/ckeditor5-core/src/command';
import { isPreElement, getPreElementWidgetSelected } from '../utils';

/**
 * The pre element close command. used to remove code block from editor.
 *
 */
export default class PreCloseCommand extends Command {

	refresh() {
		const editor = this.editor;
		const model = editor.model;
		const element = getPreElementWidgetSelected( model.document.selection );
		this.isEnabled = isPreElement( element );

		if ( this.isEnabled && element.hasAttribute( 'class' ) && element.getAttribute( 'class' ) ) {
			this.value = element.getAttribute( 'class' ).replace(/pre_wrap|ck-widget| /g, '');
			this.preElement = element;
		}else {
			this.value = false;
			this.preElement = null;
		}
	}

	/**
	 * Executes the command.
	 *
	 */
	execute( options ) {
		const model = this.editor.model;
		const preElement = getPreElementWidgetSelected( model.document.selection );

		model.change( writer => {
			writer.remove( preElement );
		} );
	}
}
