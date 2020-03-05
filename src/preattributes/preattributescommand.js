import Command from '@ckeditor/ckeditor5-core/src/command';
import { isPreElement, getPreElementWidgetSelected, getDataLanguageFromClass } from '../utils';

/**
 * The pre element attribute edit command. It is used to change the `class` attribute of `<pre>` elements.
 *
 */
export default class PreAttributesCommand extends Command {

	refresh() {
		const editor = this.editor;
		const model = editor.model;
		const element = getPreElementWidgetSelected( model.document.selection );
		this.isEnabled = isPreElement( element );
		const language_options = editor.config.get( 'preCodeBlock.languages' )||[];

		if ( this.isEnabled && element.hasAttribute( 'class' ) && element.getAttribute( 'class' ) ) {
			this.value = getDataLanguageFromClass(editor, element.getAttribute( 'class' ));
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
		if( options && !options.newValue.includes('ck-widget') )options.newValue+=" ck-widget ";

		model.change( writer => {
			writer.setAttributes( {
				'class': options.newValue,
				'data-language': getDataLanguageFromClass(this.editor,options.newValue)
			}, preElement );
		} );
	}
}
