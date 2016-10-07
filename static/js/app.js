
// choose intial center as maxlon-minlon, maxlat-minlat
// this should be in a module or something
// global map object
var map;

// callback for google maps api
function init_map_callback() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7239, lng: -73.992},
		zoom: 14
	});
}

// load trip data from the server
function get_trip_data() {
	$('#app-status').text('Loading trip data...');
	$.ajax({
		url: 'trips',
		type: 'get',
		success: on_load_success,
		error: function() {
			$('#app-status').text('Could not load trip data from the server.');
		}
	})
}

// draw trip points on the map
function update_map(trips) {

	var from_icon = {
		path: google.maps.SymbolPath.CIRCLE,
		strokeColor: 'green',
		scale: 1
	}

	var to_icon = {
		path: google.maps.SymbolPath.CIRCLE,
		strokeColor: 'red',
		scale: 1
	}

	// for each trip
	for (var i = 3000; i >= 0; i--) {
		var date_time = trips[i].date + ', ' + trips[i].time;

		// draw a pickup marker
		var from_marker = new google.maps.Marker({
			position: {lat: trips[i].from_lat, lng: trips[i].from_lon},
			map: map,
			title: 'Pickup at ' + date_time,
			icon: from_icon
		});
		from_marker.setMap(map);

		// draw a dropoff marker
		var to_marker = new google.maps.Marker({
			position: {lat: trips[i].to_lat, lng: trips[i].to_lon},
			map: map,
			title: 'Dropoff at ' + date_time,
			icon: to_icon
		});
		to_marker.setMap(map);
	}
}

function on_load_success(data) {
	$('#app-status').text('Parsing trips...');
	var trips = d3.csvParse(data, function(d) {
		return {
			date: d.Date, //new Date(+d.Year, 0, 1), // lowercase and convert "Year" to Date
			time: d.Time, // lowercase
			from_lat: +d.FromLat, // lowercase
			from_lon: +d.FromLon, // lowercase and convert "Length" to number
			to_lat: +d.ToLat,
			to_lon: +d.ToLon
		};
	});
	$('#app-status').text('Marking up map...');
	update_map(trips);
	$('#app-status').text('');
}

get_trip_data();
