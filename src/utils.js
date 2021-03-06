import {
	findOptimalInsertionPosition,
	isWidget,
	toWidget,
	toWidgetEditable
} from '@ckeditor/ckeditor5-widget/src/utils';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import first from '@ckeditor/ckeditor5-utils/src/first';


export const preElementSymbol = Symbol( 'isPreElement' );
export const PRE = "pre";

export function toPreWidget( viewElement, writer, label ) {

	writer.setCustomProperty( preElementSymbol, true, viewElement );
	return toWidget( viewElement, writer, { label: label } );
}

export function getDataLanguageFromClass( editor, language_class ) {

	let _class = language_class.replace(/ck-widget| /g, '');
	const language_options = editor.config.get( 'preCodeBlock.languages' )||[];
	const selected_language = language_options.filter(option => option.language==_class);
	return selected_language[0]&&selected_language[0].title?selected_language[0].title:_class;
}

export function toPreWidgetEditable( viewElement, writer, label ) {

	writer.setCustomProperty( preElementSymbol, true, viewElement );
	return toWidgetEditable( viewElement, writer, { label: label } );
}


export function isPreElementWidget( viewElement ) {

	return !!( viewElement && viewElement.hasOwnProperty('getCustomProperty') && viewElement.getCustomProperty( preElementSymbol ) && isWidget( viewElement ));
}

export function isPreElement( modelElement ) {

	return !!(modelElement && modelElement.is(PRE));
}

export function isParagraphElement( element ) {

	return !!(element && element.is('paragraph'));
}

export function isSpanElement( element ) {

	return !!(element && element.is('span'));
}

export function getIfInsideOfPreElement( selection ) {

	const viewElement = selection.getSelectedElement();
	if ( viewElement && isPreElement( viewElement ) ) {
		return viewElement;
	}
	const lastPosition = selection.getLastPosition();
	//we will iterate through parent nest upto 5 limit
	for (var i = 0, parent=lastPosition?lastPosition.parent:null; i < 5 && parent && parent.name!="$root"; i++, parent = parent.parent ) {
		if ( isPreElement(parent) ) return parent;
	}
	return null;
}

export function checkIfInsideOfPreElement( editor ) {

	const doc = editor.model.document;
	return !!getIfInsideOfPreElement( doc.selection );
}

export function getPreElementWidgetSelected( selection ) {

	const viewElement = selection.getSelectedElement();
	if ( isPreElementWidget( viewElement ) ) {
		return viewElement;
	}
	return getIfInsideOfPreElement(selection);
}

export function isPreElementWidgetSelected( selection ) {

	return !!getPreElementWidgetSelected( selection );
}


/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the image in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	if ( isPreElementWidgetSelected( editor.editing.view.document.selection ) ) {
		const position = getBalloonPositionData( editor );

		balloon.updatePosition( position );
	}
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected element in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;
	const getPreElement = getPreElementWidgetSelected(editingView.document.selection);

	return {
		target: editingView.domConverter.viewToDom( getPreElement ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast
		]
	};
}

export function insertPreElement( preElement, writer, model ) {

	const insertAtSelection = findOptimalInsertionPosition( model.document.selection, model );

	model.insertContent( preElement, insertAtSelection );

	if ( preElement.parent ) {
		writer.setSelection( preElement, 'in' );
	}
}

export function modelToViewAttributeConverter( editor, attributeKeys ) {

	return dispatcher => {
		for (var i = 0; i < attributeKeys.length; i++) {
			dispatcher.on( `attribute:${ attributeKeys[i] }`, converter );
		}
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const pre = conversionApi.mapper.toViewElement( data.item );

		if( data && pre && data.attributeNewValue ){
			viewWriter.setAttribute(
				data.attributeKey,
				data.attributeKey=='data-language'?getDataLanguageFromClass(editor, data.attributeNewValue):data.attributeNewValue,
				pre
			);
		}else {
			// viewWriter.removeAttribute( data.attributeKey, pre );
		}
	}
}

// export function mergeElements( model, writer, _continue ){
//
// 	let selection = model.document.selection;
// 	let firstPosition = selection.getFirstPosition();
// 	let lastPosition = selection.getLastPosition();
// 	let isRoot = firstPosition.parent === firstPosition.root;
// 	let insertPosition = isRoot ? lastPosition : writer.createPositionAfter( firstPosition.parent );
//
// 	let range = writer.createRange(firstPosition, lastPosition);
// 	let anccestor = range.getCommonAncestor();
//
// 	let inRange = false;
//
// 	if( !range.isFlat && _continue ){
//
// 		for(const child of anccestor.getChildren()){
// 			if( range.containsItem(child) ){
// 			// range.containsItem does not return 1st child in range, so Position.createBefore is used
// 				if( child.name == "image" ){
// 					// selection.setTo( new Range(firstPosition, Position.createBefore( child )) );
// 					// return { range : new Range(firstPosition, Position.createBefore( child )), position : insertPosition };
// 					return	mergeElements( model, writer, false );
// 				}
//
// 				let _position = Position.createBefore( child );
// 				writer.insert( writer.createElement( 'softBreak' ), child );
//
// 				if ( ( _position.nodeBefore instanceof Element ) && ( _position.nodeAfter instanceof Element ) ) {
//
// 					writer.merge(_position);
// 				}else{
// 					// return null;
// 					return	mergeElements( model, writer, false );
// 				}
//
// 				inRange = true;
//
// 			}
//
// 		}
//
// 	}
//
//
// 	if( _continue && inRange ){
//
// 		return	mergeElements( model, writer, true );
// 	}
//
// 	return { range : range, position : insertPosition, isRoot : isRoot };
// }
