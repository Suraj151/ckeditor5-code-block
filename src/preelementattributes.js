import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PreElementAttributesEditing from './preattributes/preattributesediting';
import PreAttributesUI from './preattributes/preattributesui';

export default class PreElementAttributes extends Plugin {

	static get requires() {
		return [ PreElementAttributesEditing, PreAttributesUI ];
	}


	static get pluginName() {
		return 'PreElementAttributes';
	}
}
