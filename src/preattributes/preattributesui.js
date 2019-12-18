import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import PreAttributesFormView from './ui/preattributesformview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { repositionContextualBalloon, getBalloonPositionData } from '../utils';
import { isPreElementWidgetSelected } from '../utils';
import classAttributesEditIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import classAttributesSelectIcon from '@ckeditor/ckeditor5-core/theme/icons/three-vertical-dots.svg';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';


export default class PreAttributesUI extends Plugin {

	static get requires() {
		return [ ContextualBalloon ];
	}


	init() {
		this._createButton();

		this._createForm();

		/**
		 * The contextual balloon plugin instance.
		 */
		this._balloon = this.editor.plugins.get( ContextualBalloon );
		/**
		 * The dropDown View displayed inside the balloon.
		 */
		this.dropDownView = this._createDropdownView( this.editor );
	}


	/**
	 * Creates the DropdownView instance.
	 * @returns DropdownView instance.
	 */
	_createDropdownView( editor ) {

		const t = editor.t;
		const options = editor.config.get( 'preCodeBlock.languages' )||[];
		const defaultTitle = t( 'Select language' );
		const dropdownTooltip = t( 'language' );

		const titles = {};
		const itemDefinitions = new Collection();
		const command = editor.commands.get( 'preAttributes' );


		for ( const option of options ) {
			const def = {
				type: 'button',
				model: new Model( {
					label: option.title,
					withText: true
				} )
			};

			def.model.bind( 'isOn' ).to( command, 'value', value => value == option.title );

			def.model.set( {
				commandName: 'preAttributes',
				commandValue: option
			} );

			// Add the option to the collection.
			itemDefinitions.add( def );

			titles[ option.language ] = option.title;
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

		dropdownView.bind( 'isEnabled' ).to( command, 'isEnabled' );
		dropdownView.buttonView.bind( 'label' ).to( command, 'value');

		this.listenTo( dropdownView, 'execute', evt => {
			editor.execute( evt.source.commandName, {
				newValue: evt.source.commandValue&&evt.source.commandValue.language ? evt.source.commandValue.language : 'auto'
			} );
			editor.editing.view.focus();
			this._removeDropDownView();
		} );

		return dropdownView;
	}

	/**
	 * Creates a button showing the balloon panel for changing the pre element class attribute and
	 * registers it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 */
	_createButton() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'EditLanguage', locale => {
			const command = editor.commands.get( 'preAttributes' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Edit language name' ),
				icon: classAttributesEditIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			this.listenTo( view, 'execute', () => this._showForm() );
			return view;
		} );

		editor.ui.componentFactory.add( 'SelectLanguage', locale => {
			const command = editor.commands.get( 'preAttributes' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Select language' ),
				icon: classAttributesSelectIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			this.listenTo( view, 'execute', () => this._addDropDownView() );
			return view;
		} );
	}

	_createForm() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		// this._balloon = editor.plugins.get( 'ContextualBalloon' );

		this._form = new PreAttributesFormView( editor.locale );

		// Render the form so its #element is available for clickOutsideHandler.
		this._form.render();

		this.listenTo( this._form, 'submit', () => {
			editor.execute( 'preAttributes', {
				newValue: this._form.labeledInput.inputView.element.value
			} );

			this._hideUI();
		} );

		this.listenTo( this._form, 'cancel', () => {
			this._hideUI();
		} );

		// Close the form on Esc key press.
		this._form.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		// Reposition the balloon or hide the form if an preblock widget is no longer selected.
		this.listenTo( editor.ui, 'update', () => {
			if ( !isPreElementWidgetSelected( viewDocument.selection ) ) {
				this._hideUI();
			} else if ( this._isEditFormVisible ) {
				repositionContextualBalloon( editor );
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this._form,
			activator: () => this._isEditFormVisible,
			contextElements: [ this._form.element ],
			callback: () => this._hideUI()
		} );
	}

	/**
	 * Removes the dropDownView from the _balloon.
	 */
	_hideUI() {

		const editor = this.editor;
		// this.stopListening( editor.ui, 'update' );
		// Remove dropDownView first because it's on top of the stack.
		this._removeDropDownView();
		this._hideForm( true );
	}

	/**
	 * Shows the {@link #_form} in the {@link #_balloon}.
	 *
	 * @private
	 */
	_showForm() {
		if ( this._isEditFormVisible ) {
			return;
		}

		const editor = this.editor;
		const command = editor.commands.get( 'preAttributes' );
		const labeledInput = this._form.labeledInput;

		if ( !this._balloon.hasView( this._form ) ) {
			this._balloon.add( {
				view: this._form,
				position: getBalloonPositionData( editor )
			} );
		}

		labeledInput.value = labeledInput.inputView.element.value = command.value || '';

		this._form.labeledInput.select();
	}

	/**
	 * Removes the {@link #_form} from the {@link #_balloon}.
	 *
	 * @param {Boolean} [focusEditable=false] Controls whether the editing view is focused afterwards.
	 * @private
	 */
	_hideForm( focusEditable ) {
		if ( !this._isEditFormVisible ) {
			return;
		}

		this._balloon.remove( this._form );

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Adds the dropDownView to the _balloon.
	 */
	_addDropDownView() {

		const editor = this.editor;
		if ( this._isDropDownViewInPanel ) {
			return;
		}
		this._balloon.add( {
			view: this.dropDownView,
			position: getBalloonPositionData(editor)
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
	 * Returns true when dropDownView is in the _balloon.
	 * @type {Boolean}
	 */
	get _isDropDownViewInPanel() {
		return this._balloon.visibleView == this.dropDownView ;
		// return this._balloon.hasView( this.dropDownView );
	}

	/**
	 * Returns `true` when the edit _form is the visible view in the {@link #_balloon}.
	 * @type {Boolean}
	 */
	get _isEditFormVisible() {
		return this._balloon.visibleView == this._form;
	}


}
