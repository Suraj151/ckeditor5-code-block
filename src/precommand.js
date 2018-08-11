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

	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = this._checkEnabled();
		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {String} link to embed
	 */
	execute( editor ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstPosition = selection.getFirstPosition();
		const lastPosition = selection.getLastPosition();
		const isRoot = firstPosition.parent === firstPosition.root;
		let insertPosition = isRoot ? Position.createAt( firstPosition ) :
								Position.createAfter( firstPosition.parent );

		model.change( writer => {

			let node = writer.createElement( PRE );

			if( selection.isCollapsed ){


				if(lastPosition && lastPosition.parent && lastPosition.parent.name == PRE){

					node = writer.createElement( 'paragraph' );
				}

				writer.insert( node, insertPosition );
				writer.setSelection( Position.createAt( node ) );

				// if(lastPosition && lastPosition.parent && lastPosition.parent.name != PRE){

				// 	writer.setSelectionAttribute( 'code', true );
				// }

			} else {

				let range = new Range(firstPosition, lastPosition);
				let anccestor = range.getCommonAncestor();

				if(lastPosition && lastPosition.parent && lastPosition.parent.name == PRE){

					node = writer.createElement( 'paragraph' );
					// writer.removeAttribute( 'code', range );
				}


				// if(lastPosition && lastPosition.parent && lastPosition.parent.name != PRE){

				// 	writer.setAttributes( {'code': true}, range );
				// }

				if( !range.isFlat ){

					let parentInfo = mergeElements( model, writer );

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

		return positionParent.name == PRE;
	}

}


function mergeElements( model, writer ){

	const selection = model.document.selection;
	const firstPosition = selection.getFirstPosition();
	const lastPosition = selection.getLastPosition();
	const isRoot = firstPosition.parent === firstPosition.root;
	const insertPosition = isRoot ? Position.createAt( firstPosition ) :
								Position.createAfter( firstPosition.parent );


	const range = new Range(firstPosition, lastPosition);
	const anccestor = range.getCommonAncestor();

	let inRange = false;

	if( !range.isFlat ){

		for(const child of anccestor.getChildren()){
			if( range.containsItem(child) ){
			// range.containsItem does not return 1st child in range, so Position.createBefore is used

				let _position = Position.createBefore( child );
				writer.insert( writer.createElement( 'softBreak' ), child );

				if ( ( _position.nodeBefore instanceof Element ) && ( _position.nodeAfter instanceof Element ) ) {

					writer.merge(_position);
				}else{
					return null;
				}

				inRange = true;

			}

		}

	}


	if( inRange ){

		return	mergeElements( model, writer );
	}

	return { range : range, position : insertPosition };

}
