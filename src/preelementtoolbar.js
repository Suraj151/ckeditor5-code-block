
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import { PRE, getPreElementWidgetSelected } from './utils';

export default class PreElementToolbar extends Plugin {

	static get requires() {
		return [ WidgetToolbarRepository ];
	}

	static get pluginName() {
		return 'PreElementToolbar';
	}

	// init() {
	// 	this.editor.config.define( PRE, {
	// 			toolbar: [ 'EditLanguage', '|', 'SelectLanguage' ]
	// 	} );
	// }

	afterInit() {
		const editor = this.editor;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		widgetToolbarRepository.register( PRE, {
			ariaLabel: editor.t( 'preCodeBlock toolbar' ),
			items: editor.config.get( 'preCodeBlock.toolbar' ) || [],
			getRelatedElement: getPreElementWidgetSelected
		} );
	}
}
