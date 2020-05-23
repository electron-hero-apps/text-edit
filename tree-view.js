marginSize = 21;

function addFolder(folderName, elementToAppendTo, _path) {
	var newRow = $.parseHTML(newFolderHTML);
	
	//console.log($(elementToAppendTo).data('margin'));
	var newMargin = $(elementToAppendTo).data('margin')
	newMargin += marginSize;
	$(newRow).find('.opener').css('margin-left', newMargin + 'px');

	$(newRow).find('.nav-item-text').html(folderName);
	$(newRow).find('.nav-item-text').data('path', path.join(_path, folderName));
	$(newRow).find('.nav-item-text').data('entryType', 'folder');
	$(newRow).find('.content-area').toggle(false);
	$(newRow).find('.content-area').data('margin', newMargin)
	$(newRow).data('margin',newMargin)

	elementToAppendTo.append(newRow);
}

function addFile(fileName, elementToAppendTo, _path) {
	var newRow = $.parseHTML(newFileHTML);

	var newMargin = $(elementToAppendTo).data('margin')
	newMargin += marginSize * 2;
	$(newRow).find('.icon-doc-text').css('margin-left', newMargin + 'px');

	$(newRow).find('.nav-item-text').html(fileName);
	$(newRow).find('.nav-item-text').data('path', path.join(_path, fileName));
	$(newRow).find('.nav-item-text').data('entryType', 'file');
	elementToAppendTo.append(newRow);
}

function addTopLevelFolder(folderName, elementToAppendTo) {
	// in the future there might be multiple of these to support multiple projects 
	// being loaded at the same time
	var newRow = $.parseHTML(topLevelFolder);
	$(newRow).find('.nav-item-text').html(folderName);
	$(newRow).find('.icon-folder').css('margin-left', marginSize + 'px');
	$(elementToAppendTo).data('margin',0)
	$(newRow).find('.nav-item-text').data('entryType', 'top-folder');
	$(newRow).data('margin',  '1')
	elementToAppendTo.append(newRow);
}

var newFolderHTML = '<span class="nav-group-item">' +
	'<span class="icon opener icon-right-open">' +
	'</span><span class="icon icon-folder"></span>' +
	'<span class="nav-item-text folder-item">libs</span>' +
	'<div class="content-area" ></div>' +
	'</span>';

var newFileHTML = '<span  class="nav-group-item">' +
	'<span class="icon icon-doc-text one-deep"></span>' +
	'<span class="nav-item-text clickable-nav-item file-item">libs</span>' +
	'</span>';

var topLevelFolder = '<span class="nav-group-item">' +
	'<span class="icon icon-folder"></span>' +
	'<span class="nav-item-text folder-item">libs</span>' +
	'</span>';


function handleItemClick() {
	var fileType = $(this).data('entryType');
	var filePath = $(this).data('path');

	if (fileType === 'file') {
		const data = fs.readFileSync(filePath, {
			encoding: 'utf8'
		});
		var filename = filePath.split(path.sep).pop();
		var ext = filename.split('.').pop();
		var mode = setMode(filename);

		console.log(filename);
		
		if (buffers[filePath]) {
			console.log('already open');
			selectBuffer(editor, filePath);
			selectTab(filePath);

		} else {
			$('#appTitle').html(filePath);
			$('#filename').html(filename);
			var res = openBuffer(filePath, data, mode);
			selectBuffer(editor, filePath);
			addTab(filePath);
		}
	}
}


function handleFileItemClick() {
	console.log('here in file item click');
	$('#files .nav-group-item').removeClass('file-active');
	var fileItem = $(this).closest('.nav-group-item');
	$(fileItem).addClass('file-active');
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
						if (fs.lstatSync(path.join(filePath, file)).isDirectory()) {
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

function caseInesensitiveSort(a, b) {
	if (a.toLowerCase() < b.toLowerCase()) return -1;
	if (a.toLowerCase() > b.toLowerCase()) return 1;
	return 0;
}

function buildTreeView(elementToAppendTo, pathToStart) {
	// when we're here we're starting from scratch
	$(elementToAppendTo).empty();
	var filesToAdd = [];
	var foldersToAdd = [];
	var topFolderName = pathToStart.split(path.sep).slice(-1)[0];

	if ((fs.lstatSync(pathToStart).isDirectory())) {

		addTopLevelFolder(topFolderName, $(elementToAppendTo))
		fs.readdir(pathToStart, function(err, files) {
			//handling error
			if (err) {
				return console.log('Unable to scan directory: ' + err);
			}
			//listing all files using forEach
			files.forEach(function(file) {
				if (file.substr(0, 1) != '.') {
					if (fs.lstatSync(path.join(pathToStart, file)).isDirectory()) {
						foldersToAdd.push(file);
					} else {
						filesToAdd.push(file);
					}
				}
			});
			_.each(foldersToAdd, function(item) {
				addFolder(item, $(elementToAppendTo), pathToStart);
			})

			filesToAdd = filesToAdd.sort(caseInesensitiveSort);

			_.each(filesToAdd, function(item) {
				addFile(item, $(elementToAppendTo), pathToStart);
			})
		});

	} else {

		var folderPathForFile = pathToStart.split(path.sep);
		var fileName = pathToStart.split(path.sep).slice(-1)[0];
		folderPathForFile.pop();
		folderPathForFile = folderPathForFile.join(path.sep);
		var folderName = folderPathForFile.split(path.sep).slice(-1)[0];

		addTopLevelFolder(folderName, $(elementToAppendTo))
		addFile(fileName, $(elementToAppendTo), folderPathForFile);

	}
}