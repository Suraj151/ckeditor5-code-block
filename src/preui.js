
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import '../theme/pre.css';

import preIcon from '../theme/icons/codeblock.svg';

const PRE = "pre";

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

		/**
		 * The dropDown View displayed inside the balloon.
		 */
		this.dropDownView = this._createDropdownView( editor );

		// Create toolbar buttons.
		this._createToolbarPreButton();

		/**
		 * The contextual balloon plugin instance.
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		// this._createToolbarPreButton();

		// Attach lifecycle actions to the the balloon.
		this._enableUserBalloonInteractions();
	}

	/**
	 * Creates the DropdownView instance.
	 * @returns DropdownView instance.
	 */
	_createDropdownView( editor ) {

		const t = editor.t;
		const options = editor.config.get( 'code_languages.options' );
		const defaultTitle = t( 'Choose language' );
		const dropdownTooltip = t( 'language' );

		const titles = {};
		const itemDefinitions = new Collection();
		const preCommand = editor.commands.get( PRE );


		for ( const option of options ) {
			const def = {
				type: 'button',
				model: new Model( {
					label: option.title,
					withText: true
				} )
			};

			def.model.bind( 'isOn' ).to( preCommand, 'value', value => value == option.title );

			def.model.set( {
				commandName: PRE,
				commandValue: option
			} );

			// Add the option to the collection.
			itemDefinitions.add( def );

			titles[ option.model ] = option.title;
		}

		const dropdownView = createDropdown( editor.locale );
		addListToDropdown( dropdownView, itemDefinitions );

		dropdownView.buttonView.set( {
			isOn: false,
			withText: true,
			tooltip: dropdownTooltip
		} );

		dropdownView.extendTemplate( {
			attributes: {
				class: [
					'ck-code-languages-dropdown'
				]
			}
		} );

		dropdownView.bind( 'isEnabled' ).to( preCommand, 'isEnabled' );
		dropdownView.buttonView.bind( 'label' ).to( preCommand, 'value');

		this.listenTo( dropdownView, 'execute', evt => {
			editor.execute( evt.source.commandName, evt.source.commandValue ? evt.source.commandValue : undefined );
			editor.editing.view.focus();
			this._hideUI();
		} );

		return dropdownView;
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
			this.listenTo( _button, 'execute', () => this._showUI() );

			return _button;
		} );
	}

	_enableUserBalloonInteractions() {
		const viewDocument = this.editor.editing.view.document;

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isUIVisible ) {
				this._hideUI();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.dropDownView,
			activator: () => this._isUIVisible,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI()
		} );
	}

	/**
	 * Adds the dropDownView to the _balloon.
	 */
	_addDropDownView() {
		if ( this._isDropDownViewInPanel ) {
			return;
		}

		const editor = this.editor;
		const preCommand = editor.commands.get( PRE );

		this._balloon.add( {
			view: this.dropDownView,
			position: this._getBalloonPositionData()
		} );

	}

	/**
	 * Removes the dropDownView from the _balloon.
	 */
	_removeDropDownView() {
		if ( this._isDropDownViewInPanel ) {
			this._balloon.remove( this.dropDownView );

			this.editor.editing.view.focus();
		}
	}

	/**
	 * Shows the UI.
	 */
	_showUI() {
		const editor = this.editor;
		const preCommand = editor.commands.get( PRE );

		if ( !preCommand.isEnabled ) {
			return;
		}

		if( preCommand.value != "select language" ){
			editor.execute(PRE);
			return
		}

		this._addDropDownView();
	}

	/**
	 * Removes the dropDownView from the _balloon.
	 */
	_hideUI() {
		if ( !this._isUIInPanel ) {
			return;
		}

		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );

		// Remove dropDownView first because it's on top of the stack.
		this._removeDropDownView();

		// Make sure the focus always gets back to the editable.
		editor.editing.view.focus();
	}


	/**
	 * Returns true when dropDownView is in the _balloon.
	 */
	get _isDropDownViewInPanel() {
		return this._balloon.hasView( this.dropDownView );
	}

	/**
	 * Returns true when dropDownView is in the _balloon.
	 */
	get _isUIInPanel() {
		return this._isDropDownViewInPanel ;
	}

	/**
	 * Returns true when dropDownView is in the _balloon and it is
	 */
	get _isUIVisible() {
		return this._balloon.visibleView == this.dropDownView ;
	}


	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		const target = view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );
		return { target };
	}

}
