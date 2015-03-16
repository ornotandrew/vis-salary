// changeable vars
var numSchools = 50,
	width = 1300,
	height = 650,
	barWidth = 5,
	earlyColor = "#69D2E7",
	midColor = "#FA6900"

// set up static stuff which doesn't need data
var legendWidth = 300;
	axisWidth = 150,
	axisHeight = height - 10,
	graphWidth = width - legendWidth - axisWidth - 10,
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
	.ticks(6, "$,");

var sourceData, data, barTip, dotTip;
function plot() {
	// get the data and set up everything else
	data = getTop(sourceData, numSchools);
	data.sort(geoSort);
	makeScales();
	makeTips();
	makeMap();
	makeGraph();
	makeAxes();
	makeLegend();
}

function makeScales() {
	yScale.domain([0,	d3.max(data, function(d) {
			return +d["Mid-Career Median Pay (10+ YE)"];
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

function makeGraph() {
	var groups = vis.selectAll("g")
		.data(data)
		.enter()
		.append("g")
		.attr("transform", function(d, i) {
			return "translate("+(axisWidth+xScale(d.Geolocation.lng))+","+0+")"
		});

	// mid career
	groups.append("rect")
		.on("mouseover", function(e) {
			e["RECTMID"] = 1;
			delete e["RECTEAR"];
			delete e["CIRCLE"];
			e.source = this;
			dotTip.show(e);
			barTip.show(e);
		})
		.on("mouseout", function(e) {
			e["RECTMID"] = 1;
			delete e["RECTEAR"];
			delete e["CIRCLE"];
			e.source = this;
			dotTip.hide(e);
			barTip.hide(e);
		})
		.attr("transform", function(d){
			return "translate(0,"+(yScale(+d["Mid-Career Median Pay (10+ YE)"])+graphHeight)+")";
		})
		.attr("height", function(d) {
			return yScale(0)-yScale(+d["Mid-Career Median Pay (10+ YE)"]);
		})
		.attr("opacity", 0.7)
		.attr("width", barWidth)
		.attr("fill", midColor);
	
	// early career
	groups.append("rect")
		.on("mouseover", function(e) {
			e["RECTEAR"] = 1;
			delete e["RECTMID"];
			delete e["CIRCLE"];
			e.source = this;
			dotTip.show(e);
			barTip.show(e);
		})
		.on("mouseout", function(e) {
			e["RECTEAR"] = 1;
			delete e["RECTMID"];
			delete e["CIRCLE"];
			e.source = this;
			dotTip.hide(e);
			barTip.hide(e);
		})
		.attr("transform", function(d){
			return "translate(0,"+(yScale(+d["Early Career Median Pay (0-5 YE)"])+graphHeight)+")";
		})
		.attr("height", function(d) {
			return yScale(0)-yScale(+d["Early Career Median Pay (0-5 YE)"]);
		})
		.attr("opacity", 0.9)
		.attr("width", barWidth)
		.attr("fill", earlyColor);
	
	// separation for bars
	groups.append("rect")
		.attr("transform", function(d){
			return "translate(0,"+(yScale(+d["Early Career Median Pay (0-5 YE)"])+graphHeight)+")";
		})
		.attr("width", barWidth)
		.attr("height", 3)
		.attr("fill", "black")
		.attr("class", "sep");
	
	// dots on map
	groups.append("circle")
		.on("mouseover", function(e) {
			e["CIRCLE"] = 1;
			delete e["RECTMID"];
			delete e["RECTEAR"];
			dotTip.show(e);
			barTip.show(e);
		})
		.on("mouseout", function(e) {
			e["CIRCLE"] = 1;
			delete e["RECTMID"];
			delete e["RECTEAR"];
			dotTip.hide(e);
			barTip.hide(e);
		})
		.attr("cy", function(d) {
			return mapScale(d.Geolocation.lat);
		})
		.attr("r", 6)
		.attr("fill", function(d) {return colorMap(+d["Rank"])});

	makeInteract();
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

function makeLegend() {
	var legendShift = 30;

	var legend = vis.append("g")
		.attr("class", "legend")
		.attr("transform", "translate("+(width-legendWidth)+",0)")
	
	// Map legend
	var midMap = graphHeight/2;
	
	legend.append("g")
		.attr("transform", "translate("+legendShift +","+(midMap - 100)+")")
		.append("text").text("Rank")
		.attr("class", "legend-heading");
	
	// top5
	legend.append("rect")
		.attr("transform", "translate("+legendShift +","+(midMap - 78)+")")
		.attr("fill", colorMap(1))
		.attr("width", 20)
		.attr("height", 20)
		.attr("stroke-width", 0.5)
		.attr("stroke", "black");
	
	
	legend.append("g")
		.attr("transform", "translate("+(legendShift+25)+","+(midMap - 60)+")")
		.append("text").text("Top 5");

	// top20
	legend.append("rect")
		.attr("transform", "translate("+legendShift +","+(midMap - 53)+")")
		.attr("fill", colorMap(20))
		.attr("width", 20)
		.attr("height", 20)
		.attr("stroke-width", 0.5)
		.attr("stroke", "black");
	
	legend.append("g")
		.attr("transform", "translate("+(legendShift+25)+","+(midMap - 35)+")")
		.append("text").text("Top 20");

	// top50
	legend.append("rect")
		.attr("transform", "translate("+legendShift +","+(midMap - 28)+")")
		.attr("fill", colorMap(numSchools))
		.attr("width", 20)
		.attr("height", 20)
		.attr("stroke-width", 0.5)
		.attr("stroke", "black");
	
	legend.append("g")
		.attr("transform", "translate("+(legendShift+25)+","+(midMap - 10)+")")
		.append("text").text("Top "+numSchools);
	

	// Graph legend
	// Mid
	var midGraph = graphHeight+(axisHeight-graphHeight)/2;
	
	legend.append("g")
		.attr("transform", "translate("+legendShift +","+(midGraph - 63)+")")
		.append("text").text("Salary")
		.attr("class", "legend-heading");

	legend.append("rect")
		.attr("transform", "translate("+legendShift +","+(midGraph - 38)+")")
		.attr("fill", midColor)
		.attr("width", 20)
		.attr("height", 20)
		.attr("stroke-width", 0.5)
		.attr("stroke", "black");

	legend.append("g")
		.attr("transform", "translate("+(legendShift+25)+","+(midGraph - 20)+")")
		.append("text").text("Mid Career");

	// Early
	var midGraph = graphHeight+(axisHeight-graphHeight)/2;
	legend.append("rect")
		.attr("transform", "translate("+legendShift +","+(midGraph + 2)+")")
		.attr("fill", earlyColor)
		.attr("width", 20)
		.attr("height", 20)
		.attr("stroke-width", 0.5)
		.attr("stroke", "black");

	legend.append("g")
		.attr("transform", "translate("+(legendShift +25)+","+(midGraph + 20)+")")
		.append("text").text("Early Career")
}

// welcome to last-minute programming, where nothing is real and everything is a hack!
function makeTips() {
	barTip = d3.tip()
		.attr("class", "d3-tip")
		.offset(function(d) {
			if(d["CIRCLE"]) { // we are being triggered by a circle
				var offset = graphHeight - mapScale(d.Geolocation.lat);
				return [offset-10,0];
			}
			else if(d["RECTEAR"]) {
				var early = +d.source.__data__["Early Career Median Pay (0-5 YE)"];
				return [-yScale(early)-10, 0];
			}
			else if(d["RECTMID"]) {
				var mid = +d.source.__data__["Mid-Career Median Pay (10+ YE)"];
				return [-yScale(mid)-10, 0];
			}
			return [-10, 0];
		})
		.html(function(d) {
			var mid = "$"+addCommas(d["Mid-Career Median Pay (10+ YE)"]);
			var early = "$"+addCommas(d["Early Career Median Pay (0-5 YE)"]);
			return "<span style='color:"+midColor+"'> Mid:\&nbsp\&nbsp</span> "+mid+"<br><span style='color:"+earlyColor+"'>Early: </span>"+early;
		});

	vis.call(barTip);
	
	dotTip = d3.tip()
		.attr("class", "d3-tip")
		.offset(function(d) {
			if(d["RECTMID"]) {
				var offset = mapScale(d.Geolocation.lat) - graphHeight - yScale(d["Mid-Career Median Pay (10+ YE)"]);
				return [offset-30,0];
			}
			else if(d["RECTEAR"]) {
				var offset = mapScale(d.Geolocation.lat) - graphHeight - yScale(d["Early Career Median Pay (0-5 YE)"]);
				return [offset-30,0];
			}
			return [-30,0]
		})
		.html(function(d) {
			return "<strong>"+d["School Name"]+"</strong><br><span style='color:#FF7BD1'>Rank: </span>"+d["Rank"]+"<br>"+d["School Type"];
		});

	vis.call(dotTip);
}

// wizardry.
d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	  });
};

var selection;
function makeInteract() {
	selection = $("g:not(.axis):not(.legend)");
	$("g").hover(
		function(e) {
			d3.select(this).moveToFront();
			selection.children().attr("class", "dim");
			$(e.target).parent().children().attr("class", "highlight");
			$(e.target).parent().children().attr("r", 12);
		},
		function(e) {
			selection.children().attr("class", "");
			$(e.target).parent().children().attr("r", 6);
		});
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
	if (x <= 5) return "#a801a4";
	else if (x <= 20) return "#ff7bd1";
	else return "#ffdde0";
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

$('input[type="range"]').rangeslider({

    // Feature detection the default is `true`.
    // Set this to `false` if you want to use
    // the polyfill also in Browsers which support
    // the native <input type="range"> element.
    polyfill: false,

    // Default CSS classes
    rangeClass: 'rangeslider',
    fillClass: 'rangeslider__fill',
    handleClass: 'rangeslider__handle',

    // Callback function
    onInit: function() {},

    // Callback function
	onSlide: function(position, value) {
		$(".output").text("Number of schools ("+value+")");
	},

    // Callback function
	onSlideEnd: function(position, value) {
		numSchools = value;
		$("#vis").empty();
		plot();
	}
});

d3.json("data.json", function(d){
	sourceData = d;
	plot();
});

