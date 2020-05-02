CodeMirror.modeURL = "../text-edit/mode/%N/%N.js";


var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
	lineNumbers: true,
	//mode: "html",
	foldGutter: true,
	gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
	styleActiveLine: true,
	extraKeys: {
		'Ctrl-/': 'toggleComment',
		'Cmd-/': 'toggleComment',
		'Cmd-Up': increaseFontSize,
		'Cmd-Down': decreaseFontSize,
		'Cmd-S': saveFile,
	},
	lint: true
});
editor.setOption("theme", 'abcdef');
editor.setSize('100%', '100%');

var fontSize = 14;

editor.getWrapperElement().style["font-size"] = fontSize + "px";


function formatJS() {
	var js = editor.getValue();
	var beautifiedJS = beautify(js, {
		indent_with_tabs: true,
		space_in_empty_paren: true
	});
	editor.setValue(beautifiedJS);
}

function formatXML() {
	var content = editor.getValue();
	var options = {
		indentation: '\t',
		filter: (node) => node.type !== 'Comment',
		collapseContent: true,
		lineSeparator: '\n'
	}
	var beautified = xml_formatter(content, {
		indent_with_tabs: true,
		space_in_empty_paren: true
	});
	editor.setValue(beautified);
}


function saveFile() {
	console.log('saving....');
	var filePath = $('#appTitle').html();
	var content = editor.getValue();
	fs.writeFile(filePath, content, function(err, data){
		console.log(err);
		console.log('file written');
	})
}

function increaseFontSize() {
	fontSize += 2;
	editor.getWrapperElement().style["font-size"] = fontSize + "px";
}

function decreaseFontSize() {
	fontSize -= 2;
	editor.getWrapperElement().style["font-size"] = fontSize + "px";
}

document.getElementById('navPane').ondragstart = (event) => {
	event.preventDefault()
}

function setMode(_val) {
	var val = $('#editorMode').val()
	if (_val) {
		val = _val;
	}
	var m, mode, spec;
	if (m = /.+\.([^.]+)$/.exec(val)) {
		var info = CodeMirror.findModeByExtension(m[1]);
		if (info) {
			mode = info.mode;
			spec = info.mime;
		}
	} else if (/\//.test(val)) {
		var info = CodeMirror.findModeByMIME(val);
		if (info) {
			mode = info.mode;
			spec = val;
		}
	} else {
		mode = spec = val;
	}

	// need to do something with linter settings, like
	// editor.setOption("lint", CodeMirror.lint.css)

	if (mode) {
		editor.setOption("mode", spec);
		CodeMirror.autoLoadMode(editor, mode);
		//document.getElementById("modeinfo").textContent = spec;
		console.log('set mode to ' + spec);
		$('#modeValue').html(spec);

	} else {
		alert("Could not find a mode corresponding to " + val);
		$('#modeValue').html('???');

	}

	switch (spec) {
		case "application/json":
			editor.setOption("lint", CodeMirror.lint.json)
			break;
		case "text/javascript":
			editor.setOption("lint", CodeMirror.lint.js)
			break;
		case "text/html":
			editor.setOption("lint", CodeMirror.lint.html)
			break;
		case "text/css":
			editor.setOption("lint", CodeMirror.lint.css)
			break;
	}
}



(function() {
	var holder = document.getElementById('navPane');

	holder.ondragover = () => {
		return false;
	};

	holder.ondragleave = () => {
		return false;
	};

	holder.ondragend = () => {
		return false;
	};

	holder.ondrop = (e) => {
		e.preventDefault();

		// for (let f of e.dataTransfer.files) {
		// 	buildTreeView('#files', f.path);
		// }
		let f = e.dataTransfer.files[0];
		buildTreeView('#files', f.path)

		return false;
	};
})();