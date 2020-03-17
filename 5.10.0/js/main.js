var margin = { left: 80, right: 20, top: 50, bottom: 100 };

var height = 500 - margin.top - margin.bottom,
	width = 800 - margin.left - margin.right;

var g = d3.select("#chart-area")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left +
		", " + margin.top + ")");

var time = 0;

// SCALES
var x = d3.scaleLog()
	.base(10)
	.range([0, width])
	.domain([142, 150000]);

var y = d3.scaleLinear()
	.range([height, 0])
	.domain([0, 90]);

var area = d3.scaleLinear()
	.range([25 * Math.PI, 1500 * Math.PI])
	.domain([2000, 1400000000]);

var continentColor = d3.scaleOrdinal(d3.schemePastel1);

// LABELS
var xLabel = g.append("text")
	.attr("y", height + 50)
	.attr("x", width / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)");

var yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Life Expectancy (Years)")

var timeLabel = g.append("text")
	.attr("y", height - 10)
	.attr("x", width - 40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1800");

// X AXIS
var xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d3.format("$"));
g.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxisCall);

// Y AXIS
var yAxisCall = d3.axisLeft(y)
	.tickFormat(function (d) { return +d; });
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall);

d3.json("data/data.json").then(function (data) {
	console.log(data);

	// CLEAN DATA
	const formattedData = data.map(function (year) {
		return year["countries"].filter(function (country) {
			var dataExists = (country.income && country.life_exp);
			return dataExists
		}).map(function (country) {
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			return country;
		})
	});

	// RUN THE CODE EVERY 0.1 SEC
	d3.interval(function () {

		// AT THE END OF OUR DATA, LOOP BACK
		time = (time < 214) ? time + 1 : 0
		update(formattedData[time]);
	}, 100);

	// FIRST RUN OF THE VISUALIZATION
	update(formattedData[0]);

})

function update(data) {
	// STANDARD TRANSITION TIME FOR THE VISUALIZATION
	var t = d3.transition()
		.duration(100);

	// JOIN NEW DATA WITH OLD ELEMENTS.
	var circles = g.selectAll("circle").data(data, function (d) {
		return d.country;
	});

	// EXIT OLD ELEMENTS NOT PRESENT IN NEW DATA
	circles.exit()
		.attr("class", "exit")
		.remove();

	// ENTER NEW ELEMENTS PRESENT IN NEW DATA
	circles.enter()
		.append("circle")
		.attr("class", "enter")
		.attr("fill", function (d) { return continentColor(d.continent); })
		.merge(circles)
		.transition(t)
		.attr("cy", function (d) { return y(d.life_exp); })
		.attr("cx", function (d) { return x(d.income) })
		.attr("r", function (d) { return Math.sqrt(area(d.population) / Math.PI) });

	// UPDATE THE TIME LABEL
	timeLabel.text(+(time + 1800))
}
