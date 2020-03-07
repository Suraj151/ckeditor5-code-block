import PreAttributesCommand from './preattributescommand';
import PreCloseCommand from './preclosecommand';
import PreHighlightCommand from '../highlighter/prehighlightcommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';


export default class PreElementAttributesEditing extends Plugin {

	init() {
		const editor = this.editor;
		editor.commands.add( 'preAttributes', new PreAttributesCommand( editor ) );
		editor.commands.add( 'preHighlight', new PreHighlightCommand( editor ) );
		editor.commands.add( 'preClose', new PreCloseCommand( editor ) );
	}
}
