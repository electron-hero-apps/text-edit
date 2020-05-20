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
      	'Alt-F': 'findPersistent'
	},
	lint: true
});
editor.setOption("theme", 'abcdef');
editor.setSize('100%', '100%');

var fontSize = 14;

var newTabHTML = '<div class="tab-item">' +
 '<span class="icon icon-cancel icon-close-tab"></span>' +
 '<span class="filename">file-one.html</span>' +
 '</div>';

editor.getWrapperElement().style["font-size"] = fontSize + "px";




var buffers = {};

function openBuffer(name, text, mode) {
  console.log('here in open buffer');
  console.log(mode);
  buffers[name] = CodeMirror.Doc(text, mode);
  return true;
}

function newBuffer(where) {
  openBuffer(name, "", "javascript");
  selectBuffer(where == "top" ? ed_top : ed_bot, name);
  var sel = where == "top" ? sel_top : sel_bot;
  sel.value = name;
}

function selectBuffer(editor, name) {
  console.log(buffers);
  var buf = buffers[name];
  if (buf.getEditor()) buf = buf.linkedDoc({sharedHist: true});
  var old = editor.swapDoc(buf);
  var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
  if (linked) {
    // Make sure the document in buffers is the one the other view is looking at
    for (var name in buffers) if (buffers[name] == old) buffers[name] = linked;
    old.unlinkDoc(linked);
  }
  editor.focus();
}

function addTab(filename) {
	var newTab = $.parseHTML(newTabHTML);
	$(newTab).find('.filename').html(filename);
	$(newTab).addClass('active');
	$('.tab-group > div').removeClass('active')
	$('.tab-group').append(newTab);
}

function handleTabItemCloseClick(event) {
	var wasActiveTab = $(this).closest('.tab-item').hasClass('active');
	var filename = $(this).find('.filename').html();
	console.log(wasActiveTab);
	
	$(this).closest('.tab-item').remove();
	event.stopPropagation();

	delete buffers[$(this).find('.filename').html()];
	
	if (wasActiveTab) {
		// see if there are any tabs left
		var tabsLeft = $('.tab-group > .tab-item');
		if (tabsLeft.length === 0) {
			editor.setValue('');
		} else {
			var firstTab = $('.tab-group > .tab-item')[0];
			$(firstTab).addClass('active');
			console.log(firstTab);
			var filename = $(firstTab).find('.filename').html();
			selectBuffer(editor, filename);
		}
	}
}

function handleTabItemClick() {
	$('.tab-group > div').removeClass('active')
	$(this).addClass('active');

	selectBuffer(editor, $(this).find('.filename').html());

}

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
		$.toast({
			heading: 'Info',
			text: 'File saved...',
			position: 'top-right',
			icon: 'info',
			hideAfter: 1000
		})
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

	//need to do something with linter settings, like
	//editor.setOption("lint", CodeMirror.lint.css)

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

	// switch (spec) {
	// 	case "application/json":
	// 		editor.setOption("lint", CodeMirror.lint.json)
	// 		break;
	// 	case "text/javascript":
	// 		editor.setOption("lint", CodeMirror.lint.js)
	// 		break;
	// 	case "text/html":
	// 		editor.setOption("lint", CodeMirror.lint.html)
	// 		break;
	// 	case "text/css":
	// 		editor.setOption("lint", CodeMirror.lint.css)
	// 		break;
	// }
	
	return spec;

}



(function() {


	if (localStorage.getItem('currentPath')) {
		buildTreeView('#files', localStorage.getItem('currentPath'))
	}

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
		localStorage.setItem('currentPath', f.path);
		buildTreeView('#files', f.path)
		
		return false;
	};
})();



