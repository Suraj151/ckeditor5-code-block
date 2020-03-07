import Command from '@ckeditor/ckeditor5-core/src/command';
import { isPreElement, getPreElementWidgetSelected } from '../utils';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

/**
 * The pre element highlight command. used to highlight code block from editor.
 *
 */
export default class PreHighlightCommand extends Command {

	refresh() {
		const editor = this.editor;
		const model = editor.model;
		const element = getPreElementWidgetSelected( model.document.selection );
		this.isEnabled = isPreElement( element );
	}

	/**
	 * Executes the command.
	 *
	 */
	execute( options ) {
		const editor = this.editor;
		const model = editor.model;
		const highlightOptions = editor.config.get( 'preCodeBlock.highlightConfig' ) || {};
		const preElement = getPreElementWidgetSelected( model.document.selection );
		const content = editor.data.stringify( preElement );
		const htmlDataProcessor = new HtmlDataProcessor();

		if( preElement && highlightOptions && highlightOptions.highlighter ){

			let pre_element = createPreElementFromContent( content, preElement.getAttribute('class'), preElement.getAttribute('data-language') );
			pre_element = highlightOptions.highlighter( pre_element, preElement.getAttribute('data-language') );

			if( preElement && pre_element && pre_element.innerHTML &&  checkHTML( pre_element.innerHTML ) ){

				pre_element = restorePreElementAttributes( pre_element, preElement.getAttribute('class'), preElement.getAttribute('data-language') );
				const viewFragment = htmlDataProcessor.toView( pre_element.outerHTML );
				const modelFragment =  editor.data.toModel( viewFragment );

				if ( modelFragment.childCount == 0 ) {
					return;
				}

				model.change( writer => {
					writer.remove( preElement );
				});

				model.insertContent( modelFragment );
	    }
		}
	}
}

function checkHTML( html ) {

  var doc = document.createElement('div');
  doc.innerHTML = html;
  return ( doc.innerHTML === html );
}

function createPreElementWithoutHighlight( preElement ) {

  preElement.innerHTML = preElement.innerHTML.replace(/<br[ \/]*>/g, '\n');
	preElement.innerHTML = encodeURI(preElement.textContent);
	preElement.textContent = decodeURI(preElement.textContent);
	preElement.innerHTML = preElement.innerHTML.replace(/\n/g, '<br/>');
	return preElement;
}

function createPreElementFromContent( content, _class, _data_language ) {

	var preElement = document.createElement('pre');
	preElement.setAttribute('class', _class);
	preElement.setAttribute('data-language', _data_language);
	preElement.innerHTML = content.trim();
	return createPreElementWithoutHighlight(preElement);
}

function restorePreElementAttributes( preElement, _class, _data_language ) {

	preElement.setAttribute('class', _class);
	preElement.setAttribute('data-language', _data_language);
	return preElement;
}

// export function initHighlighter( editor ) {
//
// 	const highlightOptions = editor.config.get( 'preCodeBlock.highlightConfig' ) || {};
//
// 	if( highlightOptions && highlightOptions.highlighter ){
//
// 		editor_data = editor.getData();
// 		editor.listenTo( editor.model.document, 'change:data', ()=>{
//
//       if( checkIfInsideOfPreElement(editor) ){
//
//         window.clearTimeout(timer_id);
//   			timer_id = window.setTimeout(function () {
//
//   				if( editor_data !== editor.getData() )
//   				updateHighlights( editor );
//   			}, highlightOptions.timeout||3000);
//       }
// 		} );
// 	}
// }
