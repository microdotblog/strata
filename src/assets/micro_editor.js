var MicroEditor = (function() {
	let isDebugging = false;
	let isIgnoringInput = false;
	let isSelectAll = false;
	let isNextButtonDisable = false;
	let isShowingChars = true;
	let hasFinishedSetup = false;
	let textBoxID = "";
	let textPreviewID = "";
	let toolbarID = "";
	let uploadPhotoHandler = null;
	let uploadAudioHandler = null;
	let backButtonHandler = null;
	let backButtonTitle = "";
	let sendDraftHandler = null;
	let sendPostHandler = null;	
	let sendPostTitle = "";
	let undoStack = [ "" ];
	let undoTimer = null;
	const undoDelay = 1000;
	const undoMaxSize = 50;
	let autocompleteTimer = null;
	const autocompleteDelay = 500;
	let autocompleteHandler = null;
	const maxCharsLength = 300;
	const maxBlockquoteLength = 600;
	const zeroWidthChar = '\u200B';
	
	function init(config) {
		textBoxID = config.textbox_id;
		textPreviewID = config.preview_id;
		toolbarID = config.toolbar_id;
		uploadPhotoHandler = config.photo_handler;
		uploadAudioHandler = config.audio_handler;
		backButtonHandler = config.back_handler;
		backButtonTitle = config.back_button ?? "← Back";
		sendDraftHandler = config.draft_handler;
		sendPostHandler = config.post_handler;		
		sendPostTitle = config.post_button ?? "Post";
		autocompleteHandler = config.autocomplete_handler;
		isShowingChars = config.show_chars ?? true;
		
		setupToolbar();
		setupListeners();
		setupFocus();		
		
		return {			
			showProgress: showProgress,
			hideProgress: hideProgress,
			showSuccess: showSuccess,
			hideSuccess: hideSuccess,
			hideCharsRemaining: hideCharsRemaining,
			replaceUsername: replaceUsername,
			cancelListeners: cancelListeners,
			setText: setText,
			getMarkdown: getMarkdown,
			getHTML: getHTML
		}
	}
	
	function debugLog(...args) {
		if (isDebugging) {
			args = args.map(arg => {
				if (typeof arg == "string") {
					const zerowidth_regex = /\u200B/g;
					return arg.replace(zerowidth_regex, '•');
				}
				else {
					return arg;
				}
			});
			console.log.apply(console, args);
		}
	}
	
	function setupToolbar() {
		const toolbar = document.getElementById(toolbarID);
		if (!toolbar) {
			return;
		}
		
		// sometimes this can be called twice? abort if we already have buttons
		let bold_button = document.getElementById(`${textBoxID}_bold_button`);
		if (bold_button) {
			return;
		}
		
		// photo button
		if (uploadPhotoHandler) {
			const photo_button = document.createElement('button');
			photo_button.onclick = uploadPhotoHandler;
			photo_button.className = 'editor_toolbar_button editor_photo_button editor_toolbar_margin';
			photo_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20px" height="20px"><path fill="currentColor" d="M 10 11 C 8.343 11 7 12.343 7 14 L 7 36 C 7 37.657 8.343 39 10 39 L 40 39 C 41.657 39 43 37.657 43 36 L 43 14 C 43 12.343 41.657 11 40 11 L 10 11 z M 10 12 L 40 12 C 41.105 12 42 12.895 42 14 L 42 33.091797 L 33.470703 25.421875 C 32.137703 24.223875 30.113203 24.225734 28.783203 25.427734 L 21.851562 31.691406 L 18.533203 28.853516 C 17.219203 27.730516 15.283609 27.733328 13.974609 28.861328 L 8 34.007812 L 8 14 C 8 12.895 8.895 12 10 12 z M 16 17 C 14.343 17 13 18.343 13 20 C 13 21.657 14.343 23 16 23 C 17.657 23 19 21.657 19 20 C 19 18.343 17.657 17 16 17 z"/></svg>';
			toolbar.appendChild(photo_button);
		}
		
		// audio button
		if (uploadAudioHandler) {
			const audio_button = document.createElement('button');
			audio_button.onclick = uploadAudioHandler;
			audio_button.className = 'editor_toolbar_button editor_audio_button editor_toolbar_margin';
			audio_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="15px" height="15px"><path fill="currentColor" d="M23.552 9.544C24.445 9.958 25 10.828 25 11.812v26.626c0 .959-.535 1.819-1.396 2.243-.354.174-.732.26-1.107.26-.539 0-1.073-.176-1.521-.521L11.33 33H7.5C5.57 33 4 31.43 4 29.5v-8C4 19.57 5.57 18 7.5 18h3.816l9.568-8.096C21.638 9.268 22.657 9.128 23.552 9.544zM30.857 31.474c-.071 0-.143-.015-.211-.047-.25-.116-.358-.414-.242-.664.77-1.653 1.159-3.425 1.159-5.265 0-2.186-.572-4.338-1.656-6.223-.138-.239-.055-.545.185-.683.236-.137.543-.056.683.185 1.17 2.036 1.789 4.36 1.789 6.721 0 1.987-.422 3.9-1.253 5.687C31.226 31.366 31.046 31.474 30.857 31.474zM36.643 35.268c-.086 0-.172-.021-.251-.067-.239-.139-.32-.444-.182-.684 1.54-2.653 2.354-5.687 2.354-8.771 0-3.696-1.139-7.23-3.292-10.221-.162-.224-.111-.536.113-.697.222-.164.535-.112.697.113 2.277 3.161 3.481 6.897 3.481 10.805 0 3.261-.86 6.468-2.488 9.273C36.982 35.179 36.814 35.268 36.643 35.268zM42.402 38.5c-.086 0-.172-.021-.251-.067-.238-.139-.32-.444-.182-.684 2.063-3.558 3.154-7.624 3.154-11.758 0-4.954-1.526-9.691-4.413-13.699-.162-.224-.111-.536.113-.697.221-.164.536-.112.697.113 3.011 4.179 4.603 9.118 4.603 14.283 0 4.31-1.138 8.549-3.289 12.26C42.742 38.411 42.574 38.5 42.402 38.5z"/></svg>';
			toolbar.appendChild(audio_button);
		}
		
		// bold button
		bold_button = document.createElement('button');
		bold_button.onclick = makeBold;
		bold_button.id = `${textBoxID}_bold_button`;
		bold_button.className = 'editor_toolbar_button editor_bold_button editor_toolbar_margin';
		bold_button.textContent = 'b';
		bold_button.disabled = true;
		toolbar.appendChild(bold_button);
		
		// italic button
		const italic_button = document.createElement('button');
		italic_button.onclick = makeItalic;
		italic_button.id = `${textBoxID}_italic_button`;
		italic_button.className = 'editor_toolbar_button editor_italic_button editor_toolbar_margin';
		italic_button.textContent = 'i';
		italic_button.disabled = true;
		toolbar.appendChild(italic_button);
		
		// link button
		const link_button = document.createElement('button');
		link_button.onclick = makeLink;
		link_button.id = `${textBoxID}_link_button`;
		link_button.className = 'editor_toolbar_button editor_link_button';
		link_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="14px" height="14px"><path fill="currentColor" d="M 41.193359 9.8125 C 37.864609 9.8125 34.535 11.080234 32 13.615234 L 26.34375 19.271484 C 21.27375 24.341484 21.27375 32.58625 26.34375 37.65625 C 27.87875 39.19025 29.688812 40.251562 31.632812 40.851562 L 32.707031 39.777344 C 33.407031 39.077344 33.902875 38.242562 34.171875 37.351562 C 32.340875 37.076563 30.578875 36.235125 29.171875 34.828125 C 25.664875 31.321125 25.664875 25.606609 29.171875 22.099609 L 34.828125 16.443359 C 38.335125 12.936359 44.049641 12.936359 47.556641 16.443359 C 51.063641 19.950359 51.063641 25.664875 47.556641 29.171875 L 44.169922 32.558594 C 44.523922 34.397594 44.544234 36.286187 44.240234 38.117188 C 44.403234 37.968187 44.572516 37.81225 44.728516 37.65625 L 50.384766 32 C 55.454766 26.93 55.454766 18.685234 50.384766 13.615234 C 47.849766 11.080234 44.522109 9.8125 41.193359 9.8125 z M 32.369141 23.146484 L 31.294922 24.222656 C 30.594922 24.922656 30.099078 25.755484 29.830078 26.646484 C 31.661078 26.921484 33.421125 27.764875 34.828125 29.171875 C 38.335125 32.678875 38.335125 38.391438 34.828125 41.898438 L 29.171875 47.556641 C 25.664875 51.063641 19.950359 51.063641 16.443359 47.556641 C 12.936359 44.049641 12.936359 38.335125 16.443359 34.828125 L 19.830078 31.441406 C 19.476078 29.602406 19.455766 27.713812 19.759766 25.882812 C 19.596766 26.031813 19.427484 26.18775 19.271484 26.34375 L 13.615234 32 C 8.5452344 37.07 8.5452344 45.314766 13.615234 50.384766 C 18.685234 55.454766 26.93 55.454766 32 50.384766 L 37.65625 44.728516 C 42.72625 39.658516 42.72625 31.41375 37.65625 26.34375 C 36.12125 24.80975 34.312141 23.747484 32.369141 23.146484 z"/></svg>`;
		link_button.disabled = true;
		toolbar.appendChild(link_button);
		
		// characters remaining
		if (isShowingChars) {
			const chars_span = document.createElement("span");
			chars_span.id = `${textBoxID}_chars_span`;
			chars_span.className = 'editor_chars_remaining';
			chars_span.innerText = '';
			toolbar.appendChild(chars_span);
		}
		
		// wrap right-aligned buttons
		const right_container = document.createElement('div')
		right_container.className = 'editor_toolbar_right';
		
		// progress spinner
		let img = document.createElement('img');
		img.id = `${textBoxID}_progress_spinner`;
		img.className = 'editor_progress_spinner';
		img.src = '/images/progress_spinner.svg?v=2021031.1';
		img.width = '25';
		img.height = '25';
		img.alt = 'Progress spinner';
		right_container.appendChild(img);
		
		// success checkmark
		let checkmark = document.createElement('span');
		checkmark.id = `${textBoxID}_success_checkmark`;
		checkmark.className = 'editor_success_checkmark';
		checkmark.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="25px" height="25px" baseProfile="basic"><path fill="currentColor" d="M32,10c12.131,0,22,9.869,22,22s-9.869,22-22,22s-22-9.869-22-22S19.869,10,32,10z M42.362,28.878 c0.781-0.781,0.781-2.047,0-2.828c-0.781-0.781-2.047-0.781-2.828,0l-9.121,9.121l-5.103-5.103c-0.781-0.781-2.047-0.781-2.828,0	c-0.781,0.781-0.781,2.047,0,2.828l6.517,6.517C29.374,39.789,29.883,40,30.413,40s1.039-0.211,1.414-0.586L42.362,28.878z"/></svg>';
		checkmark.width = '25';
		checkmark.height = '25';
		checkmark.alt = 'Success checkmark';
		right_container.appendChild(checkmark);

		// back or cancel button
		if (backButtonHandler) {
			const back_button = document.createElement('button');
			back_button.onclick = backButtonHandler;
			back_button.id = `${textBoxID}_back_button`;
			back_button.className = 'editor_toolbar_button editor_toolbar_margin';
			back_button.textContent = backButtonTitle;
			right_container.appendChild(back_button);
		}
		
		// preview button
		const preview_button = document.createElement('button');
		preview_button.onclick = togglePreview;
		preview_button.id = `${textBoxID}_preview_button`;
		preview_button.className = 'editor_toolbar_button editor_preview_button';
		preview_button.textContent = 'Preview';
		right_container.appendChild(preview_button);
		
		// update draft button
		if (sendDraftHandler) {
			const draft_button = document.createElement('button');
			draft_button.onclick = sendDraftHandler;
			draft_button.id = `${textBoxID}_draft_button`;
			draft_button.className = 'editor_toolbar_button editor_toolbar_margin';
			draft_button.textContent = 'Update Draft';
			right_container.appendChild(draft_button);
		}
		
		// post button
		if (sendPostHandler) {
			const post_button = document.createElement('button');
			post_button.onclick = sendPostHandler;
			post_button.id = `${textBoxID}_post_button`;
			post_button.className = 'editor_toolbar_button editor_post_button editor_default_button';
			post_button.textContent = sendPostTitle;
			right_container.appendChild(post_button);
		}

		toolbar.appendChild(right_container);
	}
	
	function setText(text) {
		document.getElementById(textBoxID).innerText = text;		
		applyStyles();
		moveCursorToEnd();
	}
	
	function getMarkdownByID(div_id) {
		let s = document.getElementById(div_id).innerText;
		
		// sometimes we get an extra return after code blocks
		s = s.replace(/```\n\n/g, '```\n');
		
		// clean up any zero-width spaces
		s = replaceAllZeroWidth(s);
		
		return s;
	}
	
	function getMarkdown() {
		return getMarkdownByID(textBoxID);
	}
	
	function getHTML() {		
		let s = getMarkdown();
		s = applyMicroMarkup(s);
		const converter = new showdown.Converter();
		const html = converter.makeHtml(s);
		return html;
	}
	
	function cancelListeners() {
		// cancel timers
		clearTimeout(undoTimer);
		clearTimeout(autocompleteTimer);
		
		// replace with clone which clears listeners
		const editor = document.getElementById(textBoxID);
		const new_element = editor.cloneNode(true);
		editor.parentNode.replaceChild(new_element, editor);
	}
	
	function setupListeners() {
		if (hasFinishedSetup) {
			return;
		}
		
		hasFinishedSetup = true;
		
		document.getElementById(textBoxID).addEventListener('input', function(e) {
			clearTimeout(undoTimer);
			undoTimer = setTimeout(() => {
				saveStateForUndo();
			}, undoDelay);
			
			clearTimeout(autocompleteTimer);
			autocompleteTimer = setTimeout(() => {
				checkAutocomplete();
			}, autocompleteDelay);

			applyStyles();
			scrollIfNeeded();
			checkButtons();
			updateRemaining();
			hideSuccess();
		});

		document.getElementById(textBoxID).addEventListener('compositionstart', function(e) {
			// for languages like Japanese or Chinese, we disable Markdown coloring
			isIgnoringInput = true;			
		});
		
		document.getElementById(textBoxID).addEventListener('keydown', function(e) {
			if ((e.metaKey || e.ctrlKey) && (e.key == "b")) {
				e.preventDefault();
				makeBold();
				return;
			}
			else if ((e.metaKey || e.ctrlKey) && (e.key == "i")) {
				e.preventDefault();
				makeItalic();
				return;
			}
			else if ((e.metaKey || e.ctrlKey) && (e.key == "k")) {
				e.preventDefault();
				makeLink();
				return;
			}
			else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key == "z")) {
				e.preventDefault();
				redo();
				return;
			}
			else if ((e.metaKey || e.ctrlKey) && (e.key == "z")) {
				e.preventDefault();
				undo();
				return;
			}
			else if ((e.metaKey || e.ctrlKey) && (e.key == "a")) {
				isSelectAll = true;
				return;
			}
			else if ((e.metaKey || e.ctrlKey) && (e.key == "Enter")) {
				e.preventDefault();
				if (sendPostHandler) {
					let post_button = document.getElementById(`${textBoxID}_post_button`);
					post_button.click();
				}
				return;
			}
			else if (e.key == 'Enter') {
				// languages like Japanese or Chinese
				if (e.isComposing) {
					return;
				}

				e.preventDefault();
				document.execCommand('insertHTML', false, '<br><span class="editor_plain">&#8203;</span>');
			}
			else if (/^[a-z]$/i.test(e.key)) {
				// for a-z, we don't apply styles to avoid spelling underline flicker
				isIgnoringInput = true;
			}
			else {
				isSelectAll = false;
			}
		});
		
		document.getElementById(textBoxID).addEventListener('keyup', function(e) {
			// languages like Japanese or Chinese
			if (e.isComposing) {
				return;
			}
			
			// don't do anything special for some keys
			const keys = [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Meta', 'Control', 'Enter' ];
	  	  	if (keys.includes(e.key)) {
				return;
			}

			// ignore select-all too
			if (isSelectAll) {
				return;
			}
			
			// add zero-width space to reset style if needed
			const sel = window.getSelection();
			if (sel.focusNode && sel.focusNode.parentNode && sel.focusOffset === sel.focusNode.length) {
				const parentClassList = sel.focusNode.parentNode.classList;
				if (containsFormattingClass(parentClassList)) {
//					document.execCommand('insertHTML', false, '<span class="editor_plain">&#8203;</span>');
				}
			}
			
			// ready to apply styles again
			isIgnoringInput = false;
		});

		document.addEventListener('selectionchange', function(e) {
			const editor = document.getElementById(textBoxID);
			const bold_button = document.getElementById(`${textBoxID}_bold_button`);
			const italic_button = document.getElementById(`${textBoxID}_italic_button`);
			const link_button = document.getElementById(`${textBoxID}_link_button`);
			const selection = document.getSelection();
		
			// check if selection is in the editor div and not empty
			if (selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				// check if the start or end is within editor
				if (editor.contains(range.startContainer) && editor.contains(range.endContainer) && !selection.isCollapsed) {
					bold_button.disabled = false;
					italic_button.disabled = false;
					link_button.disabled = false;
				}
				else {
					// wait to disable buttons until some action
					// to avoid confusion when buttons change right away
					isNextButtonDisable = true;
				}
			}
		});
		
		document.getElementById(textBoxID).addEventListener('paste', function(e) {
			e.preventDefault();
			
			// get just the text from the clipboard
			const text = (e.clipboardData || window.clipboardData).getData('text');
			checkLength(text);
			
			isIgnoringInput = false;
			document.execCommand('insertText', false, text);			
		});
	}

	function setupFocus() {
		const editor = document.getElementById(textBoxID);
		editor.focus();
		applyStyles();
	}
	
	function saveStateForUndo() {	
		// add latest text state	
		let editor = document.getElementById(textBoxID);
		let s = editor.innerText;		
		undoStack.push(s);

		// only keep recent changes
		if (undoStack.length > undoMaxSize) {
			undoStack.shift();  // remove oldest
		}
	}
	
	function checkLength(text = "") {
		let s = text;
		if (s.length == 0) {
			// if no text, get current text
			const editor = document.getElementById(textBoxID);
			s = editor.innerText;
		}

		// for longer text, we disable the highlighting
		const max_length_for_highlighting = 2000;
		if (s.length > max_length_for_highlighting) {
			isIgnoringInput = true;
		}
	}
	
	function showSuccess() {
		const checkmark = document.getElementById(`${textBoxID}_success_checkmark`);
		checkmark.style.display = "inline-block";
	}

	function hideSuccess() {
		const checkmark = document.getElementById(`${textBoxID}_success_checkmark`);
		checkmark.style.display = "none";
	}
	
	function showProgress() {
		// show spinner
		const progress_spinner = document.getElementById(`${textBoxID}_progress_spinner`);
		progress_spinner.style.display = "inline-block";

		// also disable post button
		const post_button = document.getElementById(`${textBoxID}_post_button`);
		post_button.disabled = true;
	}

	function hideProgress() {
		// hide spinner
		const progress_spinner = document.getElementById(`${textBoxID}_progress_spinner`);
		progress_spinner.style.display = "none";

		// also enable post button
		const post_button = document.getElementById(`${textBoxID}_post_button`);
		post_button.disabled = false;
	}
	
	function hideCharsRemaining() {
		const chars_span = document.getElementById(`${textBoxID}_chars_span`);
		if (chars_span) {
			chars_span.style.display = "none";
		}
	}
	
	function replaceUsername(partial_username, full_username) {
		const editor = document.getElementById(textBoxID);
		let s = editor.innerText;

		const partial_regex = new RegExp(partial_username + '\u200B?$');
		s = s.replace(partial_regex, full_username);

		editor.innerText = s;
		applyStyles();
		setTimeout(() => {
			moveCursorToEnd();
		}, 200);
	}
	
	function togglePreview(e) {
		e.preventDefault();
		
		let editor = document.getElementById(textBoxID);
		let preview = document.getElementById(textPreviewID);
		let button = document.getElementById(`${textBoxID}_preview_button`);
		button.classList.toggle('selected');
	
		if (editor.style.display != 'none') {
			preview.innerHTML = getHTML();
			
			editor.style.display = 'none';
			preview.style.display = 'block';
		}
		else {
			editor.style.display = 'block';
			preview.style.display = 'none';			
			editor.focus();
		}
	}
	
	function applyMicroMarkup(text) {
		s = text;
		
		// Micro.blog also auto-links usernames
		const username_regex = /@([a-zA-Z0-9@]+(?:\.[a-zA-Z]+)*)/g;
		s = s.replace(username_regex, '<a href="https://micro.blog/$1">@$1</a>');
		
		// ...and plain URLs
		// ...
		
		return s;
	}
	
	function makeBold(e = null) {
		if (e) {
			e.preventDefault();
		}
		makeMarkup("**");
	}
	
	function makeItalic(e = null) {
		if (e) {
			e.preventDefault();
		}
		makeMarkup("_");
	}
	
	function makeLink(e = null) {
		if (e) {
			e.preventDefault();
		}
		makeMarkup("[", "]()");
	}
	
	function makeMarkup(surroundingText, extraText = "") {
		let selection = window.getSelection();
		let range = selection.getRangeAt(0);
		let selected_text = selection.toString();
		
		if (!selected_text) {
			return;
		}
		
		// create a new text node with markup
		let s;
		if (extraText.length > 0) {
			s = `${surroundingText}${selected_text}${extraText}`;
		}
		else {			
			s = `${surroundingText}${selected_text}${surroundingText}`;
		}
		let markup_text = document.createTextNode(s);
		
		// replace the selected text with the new text
		range.deleteContents();
		range.insertNode(markup_text);
		
		// clear the current selection and set it to just after the inserted text
		selection.removeAllRanges();
		let new_range = document.createRange();
		
		// if link, set the cursor to 1 character previous (in between parenthesis)
		if (extraText.length > 0) {
			new_range.setStart(markup_text, markup_text.length - 1);
			new_range.setEnd(markup_text, markup_text.length - 1);
		}
		else {
			new_range.setStart(markup_text, markup_text.length);
			new_range.setEnd(markup_text, markup_text.length);
		}
		
		selection.addRange(new_range);
		
		applyStyles();
	}
	
	function undo() {
		if (undoStack.length > 0) {			
			let s = undoStack.pop();
			const editor = document.getElementById(textBoxID);
			
			// if text wouldn't change, go back further
			if (s == editor.innerText) {
				s = undoStack.pop();
			}
			
			if (s == undefined) {
				s = "";
			}
			editor.innerText = s;
			applyStyles();
			
			if (undoStack.length == 0) {
				undoStack.push("");
			}
		}		
	}
	
	function redo() {		
	}
	
	function moveCursorToEnd() {
		const editor = document.getElementById(textBoxID);

		debugLog("move to end");

		// create a range at end of the content
		const range = document.createRange();
		range.selectNodeContents(editor);
		range.collapse(false);
		
		// remove existing selection
		const selection = window.getSelection();
		selection.removeAllRanges();
		
		// add the new range (cursor) to the selection
		selection.addRange(range);
	}

	function traverseNodes(node, callback) {
		let current_pos = 0;
		let prev_char = '';
	
		function stepThroughNode(node) {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent;
				for (let i = 0; i < text.length; i++) {
					// skip double zero-width space
					const char = text[i];
					if ((char == zeroWidthChar) && (prev_char == zeroWidthChar)) {
						debugLog("hit double zero-width char");
					}
					else {
						// the position is 1 after the current char
						const next_pos = current_pos + 1;
						const next_i = i + 1;
						callback(node, char, next_pos, next_i);
						current_pos++;
					}
					prev_char = char;
				}
			}
			else if (node.nodeType === Node.ELEMENT_NODE) {
				// debugLog("got element", node.nodeName);
				for (let child = node.firstChild; child; child = child.nextSibling) {
					// debugLog("got child", node.nodeName);
					stepThroughNode(child);
					
					// reset between elements because it's like a newline
					prev_char = '';
				}
			}
		}
	
		stepThroughNode(node);
	}
	
	function saveSelection(containerElement) {
		const selection = window.getSelection();
	
		if (selection.rangeCount == 0) {
			debugLog("no selection found");
			return null;
		}
	
		const range = selection.getRangeAt(0);
		let found_pos = 0
		let found_char = '';
		
		debugLog("saving selection", range);
		
		// loop through text, looking for current selection
		traverseNodes(containerElement, (node, char, currentPos, charPos) => {
			if ((node == range.startContainer) && (charPos == range.startOffset)) {
				debugLog("found selection start");
				found_pos = currentPos;
				found_char = char;
			}
		});

		return { position: found_pos, character: found_char };
	}
		
	function restoreSelection(containerElement, saved) {
		// assume start of document
		let range = document.createRange();
		range.setStart(containerElement, 0);
		range.collapse(true);

		debugLog("restore selection");

		// loop through text, looking for saved position
		traverseNodes(containerElement, (node, char, currentPos, charPos) => {
			if (saved.position == currentPos) {
				try {
					range.setStart(node, charPos);
					range.setEnd(node, charPos);
	
					let sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				}
				catch (error) {		
					debugLog("error", error);
				}
			}
		});
	}

	function containsFormattingClass(parentClassList) {
		return parentClassList.contains('editor_bold') ||
			parentClassList.contains('editor_italic') ||
			parentClassList.contains('editor_link_text') ||
			parentClassList.contains('editor_link_url') ||
			parentClassList.contains('editor_quote') ||
			parentClassList.contains('editor_attr_name') ||
			parentClassList.contains('editor_attr_value');
	}
	
	function replaceDoubleZeroWidth(text) {
		const multi_regex = /\u200B{2,}/g;
		const single_space = '\u200B';
		return text.replace(multi_regex, single_space);
	}

	function replaceAllZeroWidth(text) {
		const zerowidth_regex = /\u200B/g;
		return text.replace(zerowidth_regex, '');
	}
	
	function applyStyles() {
		checkLength();
		if (isIgnoringInput) return;
	
		const editor = document.getElementById(textBoxID);
		let saved = saveSelection(editor);
		if (!saved || (saved.character == '')) {
			debugLog("no saved");
		}
	
		const bold_regex = /\*\*(.*?)\*\*/g;
//		const italic_regex = /(?<!<[^<>]*)_(?!<)([^_]+)(?!>)(?<!>)_(?!>[^<>]*>)/g;
		const italic_regex = /(?<!<[^<>]*)_(?!<)(?![^()]*\))([^_()]+)(?![^()]*\()(?<!>)_(?!>[^<>]*>)/g;
		const link_regex = /\[([^\]]+)\]\(([^)]*)\)/g;
		const quote_regex = /^>(.*)/gm;
		const tag_open_regex = /<([a-zA-Z\/]*)/g;
		
		// this matches with or without the zero-width space
		const tag_close_regex = /([_>\"a-zA-Z]*)(\u200B*)(>)/g;
	
		const attr_regex = /([a-zA-Z]+)="([^"<>]*)"/g;
		const code_block_regex = /(```.+```)/gs;
		const code_inline_regex = /(?<!`)`([^`]+)`(?!`)/g;
		const header_regex = /^(#+ .*)$/gm;
		const divider_regex = /(-{3,})/g;
		const username_regex = /@([a-zA-Z0-9@]+(?:\.[a-zA-Z]+)*)/g;
	
		// start with the plain content
		let plain_text = editor.innerText;
		let s = plain_text;
		s = replaceDoubleZeroWidth(s);
	
		debugLog("got text:", s);
	
		// apply HTML tag formatting first because we'll be adding other span tags
		s = s.replace(tag_open_regex, '<span class="editor_tag">&lt;$1</span>');
	
		s = s.replace(tag_close_regex, (match, tag, space, greater_than) => {
			if ((tag == "") || (tag == "span") || (tag.includes("editor_"))) {
				// don't try to replace our own special classes
				return match;
			}
			else {
				return `${tag}<span class="editor_tag">&gt;</span>`;
			}
		});		
	
		s = s.replace(attr_regex, (match, key, value, offset, original) => {
			if ((key == "class") && (value.includes("editor_"))) {
				// don't try to replace our own special classes
				return match;
			}
			else {
				return `<span class="editor_attr_name">${key}</span>=<span class="editor_attr_value">"${value}"</span>`;
			}
		});
	
		// apply Markdown styles
		s = s.replace(bold_regex, '<span class="editor_bold">**$1**</span>');
		s = s.replace(italic_regex, '<span class="editor_italic">_$1_</span>');
		s = s.replace(link_regex, '<span class="editor_link_text">[$1]</span><span class="editor_link_url">($2)</span>');
		s = s.replace(quote_regex, '<span class="editor_quote">&gt;$1</span>');
		s = s.replace(code_block_regex, '<span class="editor_code_block">$1</span>');
		s = s.replace(code_inline_regex, '<span class="editor_code_inline">`$1`</span>');
		s = s.replace(header_regex, '<span class="editor_header">$1</span>');
		s = s.replace(divider_regex, '<span class="editor_divider">$1</span>');
		s = s.replace(username_regex, '<span class="editor_username">@$1</span>');
	
		debugLog("replacing with:", s);
		
		// clean up invisible chars
		s = replaceDoubleZeroWidth(s);
	
		// set the new HTML and restore cursor
		isIgnoringInput = true;
		editor.innerHTML = s;
		if (saved) {
			restoreSelection(editor, saved);
		}
		isIgnoringInput = false;
	}
	
	function scrollIfNeeded() {
		  requestAnimationFrame(() => {
			const range = document.createRange();
			const selection = window.getSelection();
			if (selection.rangeCount > 0) {
				const editor = document.getElementById(textBoxID);
				
				const range = selection.getRangeAt(0);
				const selection_rect = range.getBoundingClientRect();
				const div_rect = editor.getBoundingClientRect();
				
				// if the cursor is below the visible area of the div
				if (selection_rect.bottom > div_rect.bottom) {
					editor.scrollTop += (selection_rect.bottom - div_rect.bottom);
				}
			}
		});
	}
	
	function checkButtons() {
		if (isNextButtonDisable) {
			const bold_button = document.getElementById(`${textBoxID}_bold_button`);
			const italic_button = document.getElementById(`${textBoxID}_italic_button`);
			const link_button = document.getElementById(`${textBoxID}_link_button`);

			bold_button.disabled = true;
			italic_button.disabled = true;
			link_button.disabled = true;
		
			isNextButtonDisable = false;
		}		
	}
	
	function checkAutocomplete() {
		if (!autocompleteHandler) {
			return;
		}
		
		const s = document.getElementById(textBoxID).innerText;

		const last_username_regex = /@([a-zA-Z0-9@]+(?:\.[a-zA-Z]+)*)\u200B?$/g;
		const match = s.match(last_username_regex);
		let last_username = match ? match[0] : "";
		last_username = last_username.replace('\u200B', '');
		
		autocompleteHandler(last_username);
	}
	
	function expandBox() {
		// show title field and update box height
		document.getElementById("posting_title_container").style.display = "block";
		document.getElementById(textBoxID).style.transition = "height 0.3s ease-in-out";
		document.getElementById(textBoxID).style.height = "calc(100vh - 250px)";
		document.getElementById(textPreviewID).style.height = "calc(100vh - 250px)";

		// don't animate anymore after expanded
		setTimeout(() => {
			document.getElementById(textBoxID).classList.add("no_transition");
		}, 1000);
	}
	
	function updateRemaining() {
		const chars_span = document.getElementById(`${textBoxID}_chars_span`);
		if (!chars_span) {
			return;
		}
		
		let s = document.getElementById(textBoxID).innerText;
		s = replaceAllZeroWidth(s);
		
		var converter = new showdown.Converter();
		var html = converter.makeHtml(s);
		const offscreen_preview = document.getElementById("offscreen_preview");
		if (!offscreen_preview) {
			return;
		}
		offscreen_preview.innerHTML = html;
		let text_only = offscreen_preview.innerText;
		const is_blockquote = html.includes("<blockquote");
		const is_photo = html.includes("<img");
		
		var len = Array.from(text_only).length;
				
		if (len == 0) {
			chars_span.innerText = "";
		}
		else if (is_blockquote) {
			chars_span.innerText = `${len}/${maxBlockquoteLength}`;
		}
		else {
			chars_span.innerText = `${len}/${maxCharsLength}`;
		}

		if (len > maxCharsLength) {
			if (is_blockquote && (len <= maxBlockquoteLength)) {
				chars_span.classList.remove("editor_chars_error");
			}
			else {
				chars_span.classList.add("editor_chars_error");
				expandBox();
			}
		}
		else {
			chars_span.classList.remove("editor_chars_error");
		}
		
		if (is_photo) {
			expandBox();
		}
	}

	return { init: init, getMarkdownByID: getMarkdownByID };
})();
