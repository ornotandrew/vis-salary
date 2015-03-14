// changeable vars
var numSchools = 250,
	width = 1000,
	height = 800,
	barWidth = 2;

// set up static stuff which doesn't need data
var axisWidth = 100,
	axisHeight = height - 100,
	graphWidth = width - axisWidth - 10,
	graphHeight = graphWidth * 0.513;

var vis = d3.select("#vis")
	.attr("width", width)
	.attr("height", height);

var xScale = d3.scale.linear(),
	yScale = d3.scale.linear(),
	mapScale = d3.scale.linear();

var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom"),
	
	yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(3, "$,");

// get the data and set up everything else
var data;
d3.json("/data.json", function(d){
	data = getTop(d, numSchools);
	data.sort(geoSort);
	makeScales();
	makeMap();
	makeDots();
	makeGraph();
	makeAxes();
});

function makeScales() {
	yScale.domain([0,	d3.max(data, function(d) {
			return +d["Early Career Median Pay (0-5 YE)"];
		})
	]);
	yScale.range([axisHeight-graphHeight, 0]);

	xScale.domain([-124.626080, -66.966399]);
	xScale.range([0, graphWidth]);

	mapScale.domain([48.879618, 24.547491]);
	mapScale.range([0, graphHeight])
}

function makeMap() {
	vis.append("image")
		.attr("xlink:href", "map.svg")
		.attr("transform", "translate("+axisWidth+",0)")
		.attr("width", graphWidth)
		.attr("height", graphHeight)
}

function makeDots() {
	vis.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return axisWidth+xScale(d.Geolocation.lng);
		})
		.attr("cy", function(d) {
			return mapScale(d.Geolocation.lat);
		})
		.attr("r", 4)
		.attr("stroke", "black")
		.attr("stroke-width", "0.3")
		.attr("fill", function(d) {return colorMap(+d["Early Career Median Pay (0-5 YE)"])})
}

function makeGraph() {
	vis.selectAll("g")
		.data(data)
		.enter().append("g")
		.attr("transform", function(d, i) {
			return "translate("+(axisWidth+xScale(d.Geolocation.lng))+","
				+(graphHeight+yScale(+d["Early Career Median Pay (0-5 YE)"]))+")"
		})
		.append("rect")
		.attr("height", function(d) {
			return yScale(0)-yScale(+d["Early Career Median Pay (0-5 YE)"]);
		})
		.attr("width", barWidth - 1)
		.attr("fill", "#4498a9");
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

function colorMap(x) {
	if (x > 70000) return "#88419d";
	else if (x > 50000) return "#8c96c6";
	else if (x > 30000) return "#b3cde3";
	else return "#edf8fb";
}

