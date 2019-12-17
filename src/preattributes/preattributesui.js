import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import PreAttributesFormView from './ui/preattributesformview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import { repositionContextualBalloon, getBalloonPositionData } from '../utils';
import { isPreElementWidgetSelected } from '../utils';
import preAttributesEditIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';


export default class PreAttributesUI extends Plugin {

	static get requires() {
		return [ ContextualBalloon ];
	}


	init() {
		this._createButton();
		this._createForm();
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

		editor.ui.componentFactory.add( 'preAttributes', locale => {
			const command = editor.commands.get( 'preAttributes' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Change language class name' ),
				icon: preAttributesEditIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			this.listenTo( view, 'execute', () => this._showForm() );
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
		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		this._form = new PreAttributesFormView( editor.locale );

		// Render the form so its #element is available for clickOutsideHandler.
		this._form.render();

		this.listenTo( this._form, 'submit', () => {
			editor.execute( 'preAttributes', {
				newValue: this._form.labeledInput.inputView.element.value
			} );

			this._hideForm( true );
		} );

		this.listenTo( this._form, 'cancel', () => {
			this._hideForm( true );
		} );

		// Close the form on Esc key press.
		this._form.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideForm( true );
			cancel();
		} );

		// Reposition the balloon or hide the form if an preblock widget is no longer selected.
		this.listenTo( editor.ui, 'update', () => {
			if ( !isPreElementWidgetSelected( viewDocument.selection ) ) {
				this._hideForm( true );
			} else if ( this._isVisible ) {
				repositionContextualBalloon( editor );
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this._form,
			activator: () => this._isVisible,
			contextElements: [ this._form.element ],
			callback: () => this._hideForm()
		} );
	}

	/**
	 * Shows the {@link #_form} in the {@link #_balloon}.
	 *
	 * @private
	 */
	_showForm() {
		if ( this._isVisible ) {
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
		if ( !this._isVisible ) {
			return;
		}

		this._balloon.remove( this._form );

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
	 *
	 * @private
	 * @type {Boolean}
	 */
	get _isVisible() {
		return this._balloon.visibleView == this._form;
	}
}
