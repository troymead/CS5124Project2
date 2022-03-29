class BarChart{
    constructor(_config, _data){
        console.log("inside the bar chart constructor");
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 10, bottom: 100, right: 60, left: 60 },
            tooltipPadding: _config.tooltipPadding || 15
          }
        console.log("Loading data now..")

        this.data = _data;

        this.initVis();
    }

    initVis(){

        let vis = this; 
  
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xValue = function(d) {
            return d.year;
        }
        vis.yValue = function(d) {
            return d.specimen_count;
        }

        let  max_specimen_count = d3.max(timelineData, d => d.specimen_count);
        vis.data.sort(function(a, b) { return d3.ascending(a.year, b.year); });

        console.log(vis.data);
        vis.xScale = d3.scaleBand()
            .domain(vis.data.map(vis.xValue)) 
            .range([0, vis.config.containerWidth])
            .paddingInner(1.0);
        console.log("xscale set");

        vis.yScale = d3.scaleLinear()
            .domain([0,max_specimen_count]) 
            .range([vis.height, 0]);
            console.log("yscale set");

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);
        console.log("Axes initialized");

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        console.log("created the actual chart");

        //// Draw the axis
        //// Append x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxis)
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");
            
        vis.svg.append("text")
            .attr("font-size", "13px")
            .attr("x", vis.width + 120)
            .attr("y", vis.height + 35)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Year");
            
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "-5.1em")
                .attr("text-anchor", "end")
                .attr("stroke", "black")
                .text("Number of Specimens Collected"); 


        console.log("Create rectangles for bar")
        // Add rectangles
        vis.chart.selectAll('.bar')
        .data(vis.data)
            .enter()
        .append('rect')
            .attr('class', 'bar')
            .attr('fill', 'steelblue')
            .attr('width', 20)//vis.xScale.bandwidth())
            .attr('height', function (d) {return vis.height - vis.yScale(d.specimen_count)})
            .attr('y', d => vis.yScale(d.specimen_count))
            .attr('x', d => vis.xScale(d.year));
    }   
}