var DOM = new function() {

	document.addEventListener("DOMContentLoaded", addEventListeners);

	var newElems = 0;

	function addEventListeners() {
		$('.content select, .content textarea').on("change", editHandler);
		$('.delete').on("click", deleteHandler);
		$('#add_p').on('click', function() {
			console.log('add p');
			addNewTextHandler('p', this);
		});
		$('#add_text').on('click', function() {
			console.log('add text');
			addNewTextHandler('text', this);
		});

		$('.content img, .content video').on('click', changeFile);
		$('.content input').on('change', editFile);

		$('#add_image').on('click', selectNewImageHandler);
		$('#add_video').on('click', selectNewVideoHandler);

		$('#imageInput, #videoInput').on('change', addNewFilesHandler);

		$('#update').on('click', updateHandler);

		dragDrop();
		
		// $('.content').on("dragleave", function() {
		// 	this.style.paddingBottom = 0;
		// 	this.style.paddingTop = 0;
		// });

	}

	function dragDrop() {

		console.log('dragDrop');

		var $elem;
		var startIndex;

		$('.content').on("dragstart", function() {
			$elem = $(this);
			$elem.addClass('moving');
			startIndex = $elem.index();
		});
		$('.content').on("dragover", function(e) {
			if($elem) {
				var thisRect = this.getBoundingClientRect();
				if(e.clientY < thisRect['top'] + 0.5 * thisRect['height']) {
					$(this).before($elem);
				} else {
					$(this).after($elem);					
				}				
			}
		});
		$('.content').on('dragend', function() {
			if($elem) {
				$elem.removeClass('moving');
				$elem.children('.dragHandle').on("mousedown", function() {
					$elem = $(this).parent();
					$elem.addClass('moving');
					$elem.remove();
					$elem = null;
				});
				if(startIndex < $elem.index()) {
					for (var i = $elem.index(); i >= startIndex; i--) {
						console.log($('.content')[i]);
					}
				} else if (startIndex > $elem.index()) {
					for (var i = startIndex; i >= $elem.index(); i--) {
						console.log($('.content')[i]);
					}					
				}
			}
		})
	}



	/*
	EVENT HANDLERS
	*/


	function editHandler() {

		var $element = $(this).parent();
		var content = $element.children('textarea').val();

		// check to see if this is newly added item. If it is we don't send it to the server
		if($element[0].hasAttribute('data-new')) {
			Updater.addContent($element, content);
		} else {
			if(Updater.editContent($element, content)) {
				$element.addClass('edited');
			}
		}
	}

	function changeFile() {
		$(this).siblings('input').click();
	}

	function editFile(e) {

		$elem = $(this);

		var displayElem = $elem.siblings('img, video')[0];
		var file = this.files[0];

		var reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = function(e) {
	    	displayElem.src = e.target.result;



	    	if($elem.parent()[0].hasAttribute('data-new')) {
				Updater.changeNewFile($elem.parent(), file);
			} else {
	    		Updater.editContent($elem.parent(), file);
			}	

	    }; 
	}

	function selectNewImageHandler(e) {
		var imgInput = document.getElementById('imageInput');
		imgInput.click();
		e.preventDefault();
	}

	function selectNewVideoHandler(e) {
		var imgInput = document.getElementById('videoInput');
		imgInput.click();
		e.preventDefault();
	}

	function addNewTextHandler(type, elem) {

		console.log(type);

		var elemHTML = "<div id='new_" + (newElems++) + "' data-type='" + type + "' draggable='true' data-new class='content'>" +
			"<textarea></textarea>";

		if(type == 'p') {
			elemHTML += "<span>Size</span><select class='size'>";

			for (var i = 10; i <= 20; i++) {
				elemHTML += "<option" + ((i == 16) ? ' selected' : '') + " value='" + i + "'>" + i + "</option>";
			}
			elemHTML += "</select>";
		}

		elemHTML = elemHTML + "<span>Language</span><select class='lang'>" +
			"<option selected value='NULL'>None</option>" +
  			"<option value='eng'>English</option>" +
  			"<option value='ita'>Italian</option>" +
  		"</select>";
		
  		elemHTML = elemHTML + "<span class='delete'>Delete</span>" +
		"</div>";

		$newElemt = $(elemHTML);

		$('.contentList').append($newElemt);
		$newElemt.children('textarea, select').on("change", editHandler);
		$newElemt.children('.delete').on("click", deleteHandler);

		scrollTo($newElemt);

	}

	function addNewFilesHandler() {
		var newFiles = this.files;
		console.log(newFiles.length);
		for (var i = 0; i < newFiles.length; i++) {
			$newElem = newFileLoadHandler(newFiles[i], i);
			previewFile($newElem, newFiles[i]);
		}
		dragDrop();
	}

	function previewFile($newElemt, file) {

		var reader = new FileReader();
		reader.addEventListener('load', function(e) {

			$newElemt.children('img, video')[0].src = e.target.result;
			$newElemt.children('img, video')[0].removeAttribute('poster');

	    	$newElemt.children('select, input').on("change", editHandler);

			$newElemt.children('img, video').on('click', changeFile);
			$newElemt.children('input').on('change', editFile);

			$newElemt.children('.delete').on("click", deleteHandler);

			Updater.addContent($newElemt, file);
	    });
	    setTimeout(function() {
	    	reader.readAsDataURL(file);
	    }, 500);

		
	}

	function loadFile(file) {
		console.log(file);
		var reader = new FileReader();
		reader.addEventListener('load', function(e) {
	    	newFileLoadHandler(e, file);
	    });
	    reader.readAsDataURL(file);
	}

	function newFileLoadHandler(file, j) {

		console.log(file);

		var elemHTML;

		if(file.type.indexOf('image') != -1) {
			elemHTML = "<div id='new_" + (newElems++) + "' data-type='img' data-new draggable='true' class='content'>";
			elemHTML += "<img src='img/loading.gif' draggable='false' />";
			elemHTML += "<input type='file' class='hidden' accept='image/*' />";
		} else {
			elemHTML = "<div id='new_" + (newElems++) + "' data-type='video' data-new draggable='true' class='content'>";
			elemHTML += "<video controls poster='img/loading.gif'></video>";
			elemHTML += "<input type='file' class='hidden' accept='video/*' />";
		}

		elemHTML += "<span>Size</span><select class='size'>";

		for (var i = 1; i <= 4; i++) {
			elemHTML += "<option" + ((i == 1) ? ' selected' : '') + " value='" + i + "'>" + i + "</option>";
		}
		elemHTML += "</select>";

		elemHTML = elemHTML + "<span>Language</span><select class='lang'>" +
			"<option selected value='NULL'>None</option>" +
  			"<option value='eng'>English</option>" +
  			"<option value='ita'>Italian</option>" +
  		"</select>";
		
  		elemHTML = elemHTML + "<span class='delete'>Delete</span>" +
		"</div>";

		$newElemt = $(elemHTML);

		$('.contentList').append($newElemt);

		console.log(j);

		if(j == 0) {
			scrollTo($newElemt);
		}

		return $newElemt

	}

	function deleteHandler() {

		var $element = $(this).parent();

		//if element has already been selected to be deleted 'undelete'
		if($element.hasClass('deleted')) {
			if(Updater.removeFromList('elem_' + $element[0].getAttribute('id'))) {
				$element.removeClass('deleted');
			}
		} else {
			// check to see if this is newly added item. If it is we don't send it to the server
			if($element[0].hasAttribute('data-new')) {
				if(Updater.removeFromList($element[0].getAttribute('id'))) {
					$element.remove();
				}
			} else {		
				if(Updater.deleteContent($element)) {
					$element.addClass('deleted');
				};
			}			
		}
	}

	function updateHandler() {
		Updater.update();
	}

	// public functions
	this.refresh = function() {
		location.reload(true);
	}


	// tools
	function scrollTo(elem) {
		$('html, body').animate({
	        scrollTop: elem.offset().top
	    }, 500);
	}

}
