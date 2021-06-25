
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

Number.prototype.deg2rad = function() {
	return this * (Math.PI / 180);
}
String.prototype.deg2rad = function() {
	return parseFloat(this).deg2rad();
}

Number.prototype.milesToYards = function() {
	return (this * 5280) / 3;
}

function getDistance(coords1, coords2, units) {
	var radius = 3958.8;
	// if units is provided and says meters, we use a different magic number
	if ( units != undefined && units == 'meters' ) {
		radius = 6371;
	}

	var degLat = (coords2.latitude - coords1.latitude).deg2rad();
	var degLong = (coords2.longitude - coords1.longitude).deg2rad();

	//console.log(typeof coords2.latitude);
	var a = 
	  Math.sin(degLat/2) * Math.sin(degLat/2) +
	  Math.cos(coords1.latitude.deg2rad()) * Math.cos(coords2.latitude.deg2rad()) * 
	  Math.sin(degLong/2) * Math.sin(degLong/2); 

	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

	if ( units != undefined && units == 'meters' ) {
		return (radius * c) * 1000;
	} else { // default is yards
		return (radius * c).milesToYards();
	}
	
}


// good functions that do cool stuff
class Range {
	constructor(startEl, endEl, currentEl, distanceEl) {
		this.startCoords   = {};
		this.currentCoords = {};
		this.endCoords     = {};
		this.distance      = 0;
		this.active        = false;

		this.__intervalId  = null;

		// element refs
		this.startEl    = startEl;
		this.endEl      = endEl;
		this.currentEl  = currentEl;
		this.distanceEl = distanceEl;
	}

	start() {
		this.active = true;
		navigator.geolocation.getCurrentPosition(function(pos) {
			this.startCoords = pos.coords;
		}.bind(this));

		this.__intervalId = setInterval(this.update.bind(this), 1000);
	}

	end() {
		this.active = false;
		navigator.geolocation.getCurrentPosition(function(pos) {
			this.endCoords = pos.coords;
		}.bind(this));

		clearInterval(this.__intervalId);
	}

	calcDistance() {
		this.distance = getDistance(this.startCoords, this.endCoords);
	}

	// update sets the current coords
	update() {
		if ( this.active ) {
			console.log('updating...');
			navigator.geolocation.getCurrentPosition(function(pos) {
				this.endCoords = pos.coords;

				this.calcDistance();

				this.updateElements();
			}.bind(this));
		}
	}

	updateElements() {
		// do something
		this.startEl.innerHTML    = `${this.startCoords.latitude}, ${this.startCoords.longitude}`;
		this.currentEl.innerHTML  = `${this.endCoords.latitude}, ${this.endCoords.longitude}`;
		this.distanceEl.innerHTML = `${this.distance}`;
		
		if ( ! this.active ) { 
			this.endEl.innerHTML = `${this.endCoords.latitude}, ${this.endCoords.longitude}`;
		}
	}
}

let range;

function rangeFinder(ev) {
	if ( ! range ) {
		range = new Range(el('startCoords'), el('endCoords'), el('currentCoords'), el('distance'));
	}

	if ( ! range.active ) {
		console.log('starting range finding');
		ev.target.innerHTML = 'Stop Range Finder';
		range.start();
	} else {
		console.log('stopping range finding');
		ev.target.innerHTML = 'Start Range Finder';
		range.end();
	}
}

// bind our page-specific events here
document.addEventListener('DOMContentLoaded', function() {

	// click handlers for all our fun stuff
	el('pageContent').addEventListener('click', function(e) {
		
		if ( e.target.getAttribute('id') == 'range' ) {
			rangeFinder(e);
		}

	});

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