var margin = { left: 80, right: 20, top: 50, bottom: 100 };

var width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var flag = true;

var t = d3.transition().duration(750);

var g = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

var yAxisGroup = g.append("g").attr("class", "y axis");

// X Scale
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

// Y SCALE
var y = d3.scaleLinear().range([height, 0]);

// X LABEL
g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

// Y LABEL
var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue");

d3.json("data/revenues.json").then(function (data) {
    // CLEAN DATA
    data.forEach(function (d) {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(function () {

        var newData = flag ? data : data.slice(1);

        update(newData);
        flag = !flag;
    }, 1000);

    // RUN THE VIS FOR THE FIRST TIME
    update(data);
});

function update(data) {

    var value = flag ? "revenue" : "profit";

    x.domain(data.map(function (d) { return d.month; }));

    y.domain([0, d3.max(data, function (d) { return d[value]; })]);

    // X AXIS
    var xAxisCall = d3.axisBottom(x);

    xAxisGroup.transition(t).call(xAxisCall);

    // Y AXIS
    var yAxisCall = d3.axisLeft(y).tickFormat(function (d) { return "$" + d; });

    yAxisGroup.transition(t).call(yAxisCall);

    // JOIN NEW DATA WITH OLD ELEMENTS.
    var rects = g.selectAll("rect")
        .data(data, function (d) {
            return d.month;
        });

    // EXIT OLD ELEMENTS NOT PRESENT IN NEW DATA.
    rects.exit()
        .attr("fill", "red")
        .transition(t)
        .attr("y", y(0))
        .attr("height", 0)
        .remove();

    // UPDATE OLD ELEMENTS PRESENT IN NEW DATA.
    rects.transition(t)
        .attr("y", function (d) { return y(d[value]); })
        .attr("x", function (d) { return x(d.month); })
        .attr("height", function (d) { return height - y(d[value]); })
        .attr("width", x.bandwidth);

    // ENTER NEW ELEMENTS PRESENT IN NEW DATA.
    rects.enter()
        .append("rect")
        .attr("fill", "grey")
        .attr("y", y(0))
        .attr("height", 0)
        .attr("x", function (d) { return x(d.month); })
        .attr("width", x.bandwidth)

        // AND UPDATE OLD ELEMENTS PRESENT IN NEW DATA.
        .merge(rects)
        .transition(t) // 750ms transition
        .attr("x", function (d) { return x(d.month); })
        .attr("width", x.bandwidth)
        .attr("y", function (d) { return y(d[value]); })
        .attr("height", function (d) { return height - y(d[value]); });

    var label = flag ? "Revenue" : "Profit";

    yLabel.text(label);
}
