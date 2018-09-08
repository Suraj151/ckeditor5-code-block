/**
 * @module embed/embedcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
/**
 * The pre plugin command.
 *
 * @extends module:core/command~Command
 */

const PRE = "pre";

export default class PreCommand extends Command {

	constructor( editor, options ) {
		super( editor );

		this.language_options = options;
	}


	refresh() {
		const model = this.editor.model;
		const doc = model.document;
		let _option = this._checkEnabled();

		this.isEnabled = true;
		this.value = _option ? _option.title:"select language";
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {String} link to embed
	 */
	execute( options ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstPosition = selection.getFirstPosition();
		const lastPosition = selection.getLastPosition();
		const isRoot = firstPosition.parent === firstPosition.root;
		let insertPosition = isRoot ? Position.createAt( firstPosition ) :
								Position.createAfter( firstPosition.parent );

		// console.log("pre option: ", options);
		let _element = options ? options.model:PRE;

		model.change( writer => {

			let node = writer.createElement( _element );

			if( selection.isCollapsed ){


				if( this._checkEnabled() ){

					node = writer.createElement( 'paragraph' );
				}

				writer.insert( node, insertPosition );
				writer.setSelection( Position.createAt( node ) );

				// if( !this._checkEnabled() ){

				// 	writer.setSelectionAttribute( 'code', true );
				// }

			} else {

				let range = new Range(firstPosition, lastPosition);
				let anccestor = range.getCommonAncestor();

				if( this._checkEnabled() ){

					node = writer.createElement( 'paragraph' );
					// writer.removeAttribute( 'code', range );
				}


				// if( !this._checkEnabled() ){

				// 	writer.setAttributes( {'code': true}, range );
				// }

				if( !range.isFlat ){

					let parentInfo = mergeElements( model, writer, true );

					if( parentInfo ){

						range = parentInfo.range;
						insertPosition = parentInfo.position;
						anccestor = range.getCommonAncestor();
					}
				}

				writer.insert( node, insertPosition );
				writer.setSelection( Position.createAt( node ) );

				if( range.isFlat ){

					writer.move( range, node );
					writer.remove( anccestor );
				}

			}

		} );
	}

	_checkEnabled() {
		const doc = this.editor.model.document;
		const positionParent = doc.selection.getLastPosition().parent;

		for( const option of this.language_options){
			if( positionParent.name == option.model ) return option;
		}

		return false;
	}

}


function mergeElements( model, writer, _continue ){

	let selection = model.document.selection;
	let firstPosition = selection.getFirstPosition();
	let lastPosition = selection.getLastPosition();
	let isRoot = firstPosition.parent === firstPosition.root;
	let insertPosition = isRoot ? Position.createAt( firstPosition ) :
								Position.createAfter( firstPosition.parent );


	let range = new Range(firstPosition, lastPosition);
	let anccestor = range.getCommonAncestor();

	let inRange = false;

	if( !range.isFlat && _continue ){

		for(const child of anccestor.getChildren()){
			if( range.containsItem(child) ){
			// range.containsItem does not return 1st child in range, so Position.createBefore is used
//				console.log("child:", child);
				if( child.name == "image" ){
					// selection.setTo( new Range(firstPosition, Position.createBefore( child )) );
					// return { range : new Range(firstPosition, Position.createBefore( child )), position : insertPosition };	
					return	mergeElements( model, writer, false );
				}

				let _position = Position.createBefore( child );
				writer.insert( writer.createElement( 'softBreak' ), child );

				if ( ( _position.nodeBefore instanceof Element ) && ( _position.nodeAfter instanceof Element ) ) {

					writer.merge(_position);
				}else{
					// return null;
					return	mergeElements( model, writer, false );
				}

				inRange = true;

			}

		}

	}


	if( _continue && inRange ){

		return	mergeElements( model, writer, true );
	}

	return { range : range, position : insertPosition };

}
