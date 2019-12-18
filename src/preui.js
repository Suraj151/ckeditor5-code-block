
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import '../theme/pre.css';
import {PRE} from './utils.js';
import preIcon from '../theme/icons/codeblock.svg';

/**
 * The pre UI feature. It introduces the Pre button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PreUI extends Plugin {
	/**
	 * @inheritDoc
	 */

	static get requires() {
		return [ ContextualBalloon ];
	}


	init() {
		const editor = this.editor;

		editor.editing.view.addObserver( ClickObserver );

		// Create toolbar buttons.
		this._createToolbarPreButton();
	}

	_createToolbarPreButton() {
		const editor = this.editor;
		const t = editor.t;

		// Add pre button to feature components.
		editor.ui.componentFactory.add( PRE, locale => {
			const command = editor.commands.get( PRE );
			const _button = new ButtonView( locale );

			_button.set( {
				isEnabled: true,
				label: t( 'Code Block' ),
				icon: preIcon,
				tooltip: true
			} );

			_button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			_button.bind( 'isOn' ).to( command, 'value', value => value != "select language" );

			// Execute command.
			this.listenTo( _button, 'execute', () => editor.execute( PRE, {
				language: 'auto',
				title: 'auto'
			} ) );

			return _button;
		} );

	}

}
