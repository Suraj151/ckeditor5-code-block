import Command from '@ckeditor/ckeditor5-core/src/command';
import { isPreElement, _checkIfPreElement, getPreElementWidgetSelected } from '../utils';

/**
 * The pre element attribute edit command. It is used to change the `class` attribute of `<pre>` elements.
 *
 */
export default class PreAttributesCommand extends Command {

	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();
		// const element = getPreElementWidgetSelected( this.editor.model.document.selection );
		// this.isEnabled = isPreElement( element ) || _checkIfPreElement( this.editor );
		this.isEnabled = isPreElement( element );

		if ( isPreElement( element ) && element.hasAttribute( 'class' ) && element.getAttribute( 'class' ) ) {
			// this.value = element.getAttribute( 'class' );
			this.value = element.getAttribute( 'class' ).replace(/pre_wrap|ck-widget| /g, '');
		}else {
			this.value = false;
		}
	}

	/**
	 * Executes the command.
	 *
	 */
	execute( options ) {
		const model = this.editor.model;
		const preElement = model.document.selection.getSelectedElement();
		// const preElement = getPreElementWidgetSelected( model.document.selection );
		if( options && !options.newValue.includes('pre_wrap') )options.newValue+=" pre_wrap ";
		if( options && !options.newValue.includes('ck-widget') )options.newValue+=" ck-widget ";

		model.change( writer => {
			writer.setAttribute( 'class', options.newValue, preElement );
		} );
	}
}
