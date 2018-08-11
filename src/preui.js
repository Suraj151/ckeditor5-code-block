
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import preIcon from '../theme/icons/codeblock.svg';

// import '../../theme/code.css';

const preCommand = "pre";

/**
 * The pre UI feature. It introduces the Pre button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PreUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add pre button to feature components.
		editor.ui.componentFactory.add( preCommand, locale => {
			const command = editor.commands.get( preCommand );
			const view = new ButtonView( locale );

			view.set( {
				isEnabled: true,
				label: t( 'Code Block' ),
				icon: preIcon,
				tooltip: true
			} );

			view.bind( 'isOn','isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( preCommand, editor );
			} );

			return view;
		} );
	}
}
