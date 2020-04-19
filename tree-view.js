function addFolder(folderName, elementToAppendTo, path) {
	var newRow = $.parseHTML(newFolderHTML);
	$(newRow).find('.nav-item-text').html(folderName);
	$(newRow).find('.nav-item-text').data('path', path + '/' + folderName + '/');
	$(newRow).find('.nav-item-text').data('entryType', 'folder');
	$(newRow).find('.content-area').toggle(false);
	elementToAppendTo.append(newRow);
}

function addFile(fileName, elementToAppendTo, path) {
	var newRow = $.parseHTML(newFileHTML);
	$(newRow).find('.nav-item-text').html(fileName);
	$(newRow).find('.nav-item-text').data('path', path + '/' + fileName);
	$(newRow).find('.nav-item-text').data('entryType', 'file');
	elementToAppendTo.append(newRow);
}

var newFolderHTML = '<span class="nav-group-item">' +
	'<span class="icon opener icon-right-open">' +
	'</span><span class="icon icon-folder"></span>' +
	'<span class="nav-item-text">libs</span>' +
	'<div class="content-area" ></div>' +
	'</span>';

var newFileHTML = '<span class="nav-group-item">' +
	'<span class="icon icon-doc-text one-deep"></span>' +
	'<span class="nav-item-text">libs</span>' +
	'</span>';

function handleItemClick() {
	var fileType = $(this).data('entryType');
	var filePath = $(this).data('path');

	if (fileType === 'file') {
		const data = fs.readFileSync(filePath, {
			encoding: 'utf8'
		});
		editor.setValue(data);
	}
}

function handleOpenerClick() {
	var icon = $(this);

	if ($(this).hasClass('icon-right-open')) {
		$(icon).removeClass('icon-right-open')
		$(icon).addClass('icon-down-open');
		var content = $(this).closest('.nav-group-item').find('.content-area');
		// check to see if we need to add something inside this one
		if ($(content).children().length === 0) {

			var itemText = $(this).closest('.nav-group-item').find('.nav-item-text');
			var fileType = $(itemText).data('entryType');
			var filePath = $(itemText).data('path');
            var filesToAdd = [];
        	var foldersToAdd = [];
            
			fs.readdir(filePath, function(err, files) {
				//handling error
				if (err) {
					return console.log('Unable to scan directory: ' + err);
				}
				//listing all files using forEach
				files.forEach(function(file) {
					if (file.substr(0, 1) != '.') {
						if (fs.lstatSync(filePath + '/' + file).isDirectory()) {
							foldersToAdd.push(file);
						} else {
							filesToAdd.push(file);
						}
					}
				});
				_.each(foldersToAdd, function(item) {
					addFolder(item, content, filePath);
				})
				_.each(filesToAdd, function(item) {
					addFile(item, content, filePath);
				})
			});
		}
		$(content).toggle(true);
	} else {
		$(icon).removeClass('icon-down-open')
		$(icon).addClass('icon-right-open');
		var content = $(this).closest('.nav-group-item').find('.content-area');
		$(content).toggle(false);
	}
}

function buildTreeView(elementToAppendTo) {
	var filesToAdd = [];
	var foldersToAdd = [];
	fs.readdir(__dirname, function(err, files) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
		}
		//listing all files using forEach
		files.forEach(function(file) {
			if (file.substr(0, 1) != '.') {
				if (fs.lstatSync(__dirname + '/' + file).isDirectory()) {
					foldersToAdd.push(file);
				} else {
					filesToAdd.push(file);
				}
			}
		});
		_.each(foldersToAdd, function(item) {
			addFolder(item, elementToAppendTo,  __dirname);
		})
		_.each(filesToAdd, function(item) {
			addFile(item, elementToAppendTo, __dirname);
		})
	});
}