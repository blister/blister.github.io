
// page holds our current template we want to load
var page = '?prototypes';

function el(elId) {
	return document.getElementById(elId);
}

function loadPage(href) {
	var template = href.split('?')[1];
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if ( this.status != 404 ) {
			el('pageContent').innerHTML = this.responseText;
		} else {
			return loadPage('?404');
		}
		
	};
	xhr.open('GET', `/templates/${template}.html`);
	xhr.send();
}

// bind our page-specific events here
document.addEventListener('DOMContentLoaded', function() {

	if ( window.location.search ) {
		loadPage(window.location.search);
	} else {
		loadPage(page);
	}

	el('menu').addEventListener('click', function(e) {
		if ( e.target.href ) {
			e.preventDefault();
			loadPage(e.target.href);
		}
	});

});