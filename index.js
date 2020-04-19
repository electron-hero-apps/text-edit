var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
	lineNumbers: true,
	mode: "javascript",
	foldGutter: true,
	gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
	extraKeys: {
		'Ctrl-/': 'toggleComment',
		'Cmd-/': 'toggleComment',
		'Cmd-Up': increaseFontSize,
		'Cmd-Down': decreaseFontSize,
		'Cmd-S': saveFile
		
	},
	lint: true
});
editor.setOption("theme", 'abcdef');
editor.setSize('100%', '100%');

var fontSize = 14;

editor.getWrapperElement().style["font-size"] = fontSize+"px";


function formatJS() {
	var js = editor.getValue();
	var beautifiedJS = beautify(js, {
		indent_with_tabs: true,
		space_in_empty_paren: true
	});
	editor.setValue(beautifiedJS);
}

function saveFile() {
	console.log('saving....');
}

function increaseFontSize() {
	fontSize += 2;
	editor.getWrapperElement().style["font-size"] = fontSize+"px";
}

function decreaseFontSize() {
	fontSize -= 2;
	editor.getWrapperElement().style["font-size"] = fontSize+"px";
}