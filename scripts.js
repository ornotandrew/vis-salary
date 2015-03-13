// changeable vars
var numSchools = 20,
	width = 1000,
	height = 800,
	barWidth = 3;

// set up static stuff which doesn't need data
var	axisWidth = 100,
	axisHeight = height - 100,
	graphHeight = axisHeight/2,
	graphWidth = width - axisWidth;

var vis = d3.select("#vis")
	.attr("width", width)
	.attr("height", height);

var xScale = d3.scale.linear(),
	yScale = d3.scale.linear();

var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom"),
	
	yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(3, "$,");

// get the data and set up everything else
d3.json("/data.json", function(d){
	data = getTop(d, numSchools);
	data.sort(geoSort);
	makeScales(data);
	makeMap();
	makeGraph();
	makeAxes();
});


function getTop(d, n) {
	result = [];
	for (i=0; i<n; i++) {
		result.push(d[i]);
	}
	return result;
}

function geoSort(a, b) {
	if (a.Geolocation.lng < b.Geolocation.lng)
		 return -1;
	if (a.Geolocation.lng > b.Geolocation.lng)
		return 1;
	return 0;
}

function makeScales(d) {
	yScale.domain([ 
		//d3.min(data, function(d){
			//return +d["Early Career Median Pay (0-5 YE)"];
		//}),
		0,
		d3.max(data, function(d){
			return +d["Early Career Median Pay (0-5 YE)"];
		})
	]);
	yScale.range([graphHeight, 0]);

	xScale.domain([
		d3.min(data, function(d){
			return d.Geolocation.lng;

		}),
		d3.max(data, function(d){
			return d.Geolocation.lng;
		})
	]);
	xScale.range([0, graphWidth-10]);
}

function makeMap() {
	vis.append("image")
		.attr("xlink:href", "map.svg")
		.attr("width", width)
		.attr("height", graphHeight)
}

function makeGraph() {
	vis.selectAll("g")
		.data(data)
		.enter().append("g")
		.attr("transform", function(d, i) {
			return "translate(" + (axisWidth+xScale(d.Geolocation.lng)) + ",0)";
		})
		.append("rect")
		.attr("y", function(d) {
			return axisHeight - yScale(+d["Early Career Median Pay (0-5 YE)"]);
		})
		.attr("height", function(d) {
			return yScale(+d["Early Career Median Pay (0-5 YE)"]);
		})
		.attr("width", barWidth - 1);
}

function makeAxes() {
	vis.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate("+axisWidth+","+axisHeight+")")
		.call(xAxis);

	vis.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate("+(axisWidth-10)+","+graphHeight+")")
		.call(yAxis);
}

