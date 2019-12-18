import PreAttributesCommand from './preattributescommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';


export default class PreElementAttributesEditing extends Plugin {

	init() {
		const editor = this.editor;
		editor.commands.add( 'preAttributes', new PreAttributesCommand( editor ) );
	}
}
