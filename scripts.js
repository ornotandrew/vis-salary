// set up static stuff which doesn't need data
var numSchools = 100,
	margin = {top: 20, right: 30, bottom: 30, left: 100},
	width = 1000 - margin.left - margin.right,
	height = 300 - margin.top - margin.bottom,
	barWidth = 3;

var data = [],
	xScale = d3.scale.linear(),
	yScale = d3.scale.linear();

var chart = d3.select("#vis")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
	.ticks(3, "$,");

// get the data and set up everything else
d3.json("/data.json", function(d){
	// grab the top schools
	for (i=0; i<numSchools; i++) {
		data.push(d[i]);
	}
	
	data.sort(compare);

	yScale.domain([ 
		d3.min(data, function(d){
			return +d["Early Career Median Pay (0-5 YE)"];
		}),
		//0,
		d3.max(data, function(d){
			return +d["Early Career Median Pay (0-5 YE)"];
		})
	]);
	yScale.range([height, 0]);

	xScale.domain([
		d3.min(data, function(d){
			return d.Geolocation.lng;

		}),
		d3.max(data, function(d){
			return d.Geolocation.lng;
		})
	])
	xScale.range([0, width])

	// add the axes
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)

	makeVis();
});

function compare(a, b) {
	if (a.Geolocation.lng < b.Geolocation.lng)
		 return -1;
	if (a.Geolocation.lng > b.Geolocation.lng)
		return 1;
	return 0;
}

function makeVis(){
	chart.selectAll("g")
		.data(data)
		.enter().append("g")
		.attr("transform", function(d, i) {
			return "translate(" + xScale(d.Geolocation.lng) + ",0)";
		})
		.append("rect")
		.attr("y", function(d) {
			return height - yScale(+d["Early Career Median Pay (0-5 YE)"]);
		})
		.attr("height", function(d) {
			return yScale(+d["Early Career Median Pay (0-5 YE)"]);
		})
		.attr("width", barWidth - 1);
}

