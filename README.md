# ckeditor5-code-block
pre element (to write longer code snippets) for CKEditor 5. https://ckeditor.com


this will enable add code block feature to editor with language select feature. languages are added that supported by Javascript syntax highlighter.
additionally edit option is provided where we can edit language name. actually it adds entered language as classname to pre element.

use

```js
$(document).ready(function() {
  $('pre').each(function(i, block) {
    hljs.highlightBlock(block);
  });
});
```
to hilight code. for more refer https://github.com/highlightjs/highlight.js

**Example**

There are CKEditor5 Builds available on there official page as

Classic editor,
Inline editor,
Balloon editor,
Document editor

let assume Classic editor example

First, install the build from npm:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

And use it in your website:

```html
<div id="editor">
	<p>This is the editor content.</p>
</div>
<script src="./node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js"></script>
<script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
</script>
```

Or in your JavaScript application:

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Or using the CommonJS version:
// const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );

ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

**Note:** If you are planning to integrate CKEditor 5 deep into your application, it is actually more convenient and recommended to install and import the source modules directly (like it happens in `ckeditor.js`). Read more in the [Advanced setup guide](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/integration/advanced-setup.html).


**Including ckeditor5-code-block with classic editor**

now install code-block package

```bash
npm install ckeditor5-code-block
```


open "ckeditor5-build-classic/src/ckeditor.js" source file where you can see imported packages.
now import ckeditor5-code-block as shown in below example and build.

```js

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import PreElement from 'ckeditor5-code-block/src/pre';
import PreElementToolbar from 'ckeditor5-code-block/src/preelementtoolbar'; // pre element toolbar to edit its language class

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Link,
	PreElement,
  PreElementToolbar,
	List,
	Paragraph
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'imageUpload',
      'pre',
			'blockQuote',
			'undo',
			'redo'
		]
	},
	image: {
		toolbar: [
			'imageStyle:full',
			'imageStyle:side',
			'|',
			'imageTextAlternative'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

```
After build you can see code block pre element icon in classic editor top bars.

**Custom Options**

you can define language select/edit option for code block. just add this options in editor config as shown in below example. custom tab in code edit added as no of white spaces. you can adjust this from same config option as below.


```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Or using the CommonJS version:
// const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );

var _code_languages = ["auto","c","cs","cpp","html","xml","css","javascript","python","sql","php","perl","ruby","markdown"];

ClassicEditor
	.create( document.querySelector( '#editor' ), {

        preCodeBlock :{
		languages: _code_languages.map( _language => {return{
			language: _language,
			title: _language=="cs"?"c#":_language
		};}),
		toolbar: [ 'EditLanguage', '|', 'SelectLanguage' ],
		noOfSpaceForTabKey: 4
	}

	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

**key pairs**
added ctrl+uparrow and ctrl+downarrow to get outside when inside of codeblock.

Help to imporove this as i am new to this platform.

Thank you.

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file.
