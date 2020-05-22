var currentEditableItem;
var oldText;
var currentListItem;

const {
	remote
} = require('electron')
const {
	Menu,
	MenuItem
} = remote

const contextMenu = new Menu()

contextMenu.append(new MenuItem({
	label: 'New File',
	click() {
		console.log('new file...');
		var filePath = localStorage.getItem('currentPath');
		var fileContent = "";
		var filename = "untitled.txt";
		fs.writeFile(path.join(filePath, filename), fileContent, (err) => {
			if (err) throw err;
			buildTreeView('#files', localStorage.getItem('currentPath'))
		});

	}
}))

contextMenu.append(new MenuItem({
	label: 'New Directory',
	click() {
		console.log('new directory...');
	}
}))

const fileContextMenu = new Menu();

fileContextMenu.append(new MenuItem({
	label: 'Rename',
	click() {
		console.log('here in rename click');
		$(currentListItem).attr('contenteditable', true);
		oldText = $(currentListItem).html();
		$(currentListItem).focus();
	}
}));

fileContextMenu.append(new MenuItem({
	label: 'Delete',
	click() {
		if (confirm("Are you sure?") === true) {
			//var filePath = localStorage.getItem('currentPath');
			var filePath = $(currentListItem).data('path');
			
			fs.unlink(filePath, function(err, data) {
				if (err) {
					alert(err)
				}
				buildTreeView('#files', localStorage.getItem('currentPath'))
			});
		}
	}
}));


const folderContextMenu = new Menu();

folderContextMenu.append(new MenuItem({
	label: 'Rename',
	click() {
		console.log('here in rename click');
		$(currentListItem).attr('contenteditable', true);
		oldText = $(currentListItem).html();
		$(currentListItem).focus();
	}
}));

folderContextMenu.append(new MenuItem({
	label: 'Delete',
	click() {
		if (confirm("Are you sure?") === true) {
			var filePath = localStorage.getItem('currentPath');
			var filename = $(currentListItem).html();
			fs.unlink(path.join(filePath, filename), function(err, data) {
				if (err) {
					alert(err)
				}
				buildTreeView('#files', localStorage.getItem('currentPath'))
			});
		}
	}
}));

folderContextMenu.append(new MenuItem({
	label: 'New File',
	click() {
		console.log('new file...');
		var folderPath = $(currentListItem).data('path');
		console.log(folderPath);
		var fileContent = 'no information yet';
		var filename = "untitled.txt";
		fs.writeFile(path.join(folderPath, filename), fileContent, (err) => {
			if (err) throw err;
			buildTreeView('#files', localStorage.getItem('currentPath'))
		});
	}
}));

folderContextMenu.append(new MenuItem({
	label: 'New Folder',
	click() {
		var folderPath = $(currentListItem).data('path');
		fs.mkdir(path.join(folderPath, 'New Folder'), function(err, data){
			console.log(err);
			console.log('created');
		});
	}
}));


window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
	var x = e.clientX;
	var y = e.clientY;
	var el = document.elementFromPoint(x, y);
	if ($(el).hasClass('pane-sm')) {
		currentListItem = el;
		contextMenu.popup({
			window: remote.getCurrentWindow()
		})
	}

	if ($(el).hasClass('file-item')) {
		currentListItem = el;
		fileContextMenu.popup({
			window: remote.getCurrentWindow()
		})
	}

	if ($(el).hasClass('folder-item')) {
		currentListItem = el;
		folderContextMenu.popup({
			window: remote.getCurrentWindow()
		})
	}

}, false)


// function handleFileItemRightClick(event) {
// 	console.log('here in right click')
// 	currentEditableItem = $(this);
// 	$(this).attr('contenteditable', true);
// 	oldText = $(this).html();
// 	$(this).focus();
// 	event.stopPropagation();
// }

function handleFileItemKeyDown(event) {
	if (event.keyCode === 13 || event.keyCode === 27) {

		if (event.keyCode === 27) {
			$(currentListItem).html(oldText);
		}

		if (event.keyCode === 13) {
			// hit enter, go ahead and rename file
			var oldPath = $(this).data('path');
			newPath = oldPath.split(path.sep);
			newPath.pop();
			newPath = newPath.join(path.sep);
			newPath = path.join(newPath,$(currentListItem).html())
			fs.rename(oldPath, newPath, function(err, data) {
				console.log(err);
				console.log('here in rename callback')
			})
		}

		$(currentListItem).removeAttr('contenteditable');
		$(currentListItem).blur();

	}
}