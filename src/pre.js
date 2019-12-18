/**
 * @module embed/embed
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PreEditing from './preediting';
import PreUI from './preui';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import PreElementAttributes from './preelementattributes';


export default class PreElement extends Plugin {

	static get requires() {
		return [ PreEditing, Widget, PreUI, PreElementAttributes ];
	}


	static get pluginName() {
		return 'PreElement';
	}
}
