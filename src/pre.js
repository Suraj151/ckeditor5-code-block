/**
 * @module embed/embed
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PreEditing from './preediting';
import PreUI from './preui';


export default class PreElement extends Plugin {

	static get requires() {
		return [ PreEditing, PreUI ];
	}


	static get pluginName() {
		return 'PreElement';
	}
}
