import PreAttributesCommand from './preattributescommand';
import PreCloseCommand from './preclosecommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';


export default class PreElementAttributesEditing extends Plugin {

	init() {
		const editor = this.editor;
		editor.commands.add( 'preAttributes', new PreAttributesCommand( editor ) );
		editor.commands.add( 'preClose', new PreCloseCommand( editor ) );
	}
}
