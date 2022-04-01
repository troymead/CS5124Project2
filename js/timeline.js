class Timeline{
    constructor(_config, _data){
        console.log("inside the bar chart constructor");
        this.config = {
            parentElement: _config.parentElement,
            width: _config.containerWidth || 800,
            height: _config.containerHeight || 240,
            margin: {top: 10, right: 10, bottom: 100, left: 45},
            // tooltipPadding: _config.tooltipPadding || 15,
            contextMargin: {top: 280, right: 10, bottom: 20, left: 45},
            contextHeight: 50
          }
        console.log("Loading data now..")

        this.data = _data;

        this.initVis();
    }

    // Adapted from: https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-brushing-linking

    initVis() {
        let vis = this;

        const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
        const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;

        vis.xScaleFocus = d3.scaleBand()
            .range([0, vis.config.width])
            .paddingInner(0.1);

        vis.xScaleContext = d3.scaleBand()
            .range([0, vis.config.width])
            .paddingInner(0.1);


        vis.yScaleFocus = d3.scaleLinear()
            .range([vis.config.height, 0])
            .nice();

        vis.yScaleContext = d3.scaleLinear()
            .range([vis.config.contextHeight, 0])
            .nice();

        // Initialize axes
        vis.xAxisFocus = vis.makeAxis(vis.xScaleFocus)

        vis.xAxisContext = d3.axisBottom(vis.xScaleContext).tickSizeOuter(0)
            .tickFormat((interval,i) => {
                return i%5 !== 0 ? " ": interval;
            });

        vis.yAxisFocus = d3.axisLeft(vis.yScaleFocus);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', containerWidth)
            .attr('height', containerHeight);

        // Append focus group with x- and y-axes
        vis.focus = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.focus.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);
        
        vis.xAxisFocusG = vis.focus.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.config.height})`);

        vis.yAxisFocusG = vis.focus.append('g')
            .attr('class', 'axis y-axis');

        // Append context group with x- and y-axes
        vis.context = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.contextMargin.left},${vis.config.contextMargin.top})`);

        vis.xAxisContextG = vis.context.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.config.contextHeight})`);

        vis.brushG = vis.context.append('g')
            .attr('class', 'brush x-brush');

        // Initialize brush component
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.config.width, vis.config.contextHeight]])
            .on('brush', function({selection}) {
                if (selection) vis.brushed(selection);
            })
            .on('end', function({selection}) {
                if (!selection) vis.brushed(null);
            });


        vis.updateVis();
    }
    
    makeAxis(scale) {
        var n=5, 
            data = scale.domain(),
            dataLength = data.length;
        // console.log(data)
        // console.log(dataLength)
        
        return d3.axisBottom(scale).tickValues( 
          dataLength > n ? d3.ticks(data[0], data[dataLength-1], n) : data);
    }

    updateVis() {
        let vis = this;
 
        vis.xValue = d => d.year;
        vis.yValue = d => d.specimen_count;

        // Set the scale input domains
        vis.xScaleFocus.domain(vis.data.map(vis.xValue).sort())
        vis.yScaleFocus.domain(d3.extent(vis.data, vis.yValue));
        vis.xScaleContext.domain(vis.xScaleFocus.domain());
        vis.yScaleContext.domain(vis.yScaleFocus.domain());

        vis.xAxisFocus = vis.makeAxis(vis.xScaleFocus)

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // Add rectangles
        let timeline_bars = vis.focus.selectAll('.timeline-bar')
            .data(vis.data)
            .join('rect');

        timeline_bars.style('opacity', 0.5)
            .transition().duration(1000)
            .style('opacity', 1)
            .attr('class', 'timeline-bar')
            .attr('x', d => vis.xScaleFocus(vis.xValue(d)))
            .attr('width', vis.xScaleFocus.bandwidth())
            .attr('height', d => (vis.config.height - vis.yScaleFocus(vis.yValue(d))))
            .attr('y', d => vis.yScaleFocus(vis.yValue(d)))


        timeline_bars.on('mouseover', function(event, d) {
            d3.select('#timeline-tooltip')
                .style('opacity', 1)
                .style('z-index', 1000000)
                .html(`<div class="timeline-tooltip-label">Year: ${d.year}</br>Specimens collected: ${d.specimen_count}</div>`)
                .style('left', (event.pageX + 10) + 'px')   
                .style('top', (event.pageY + 10) + 'px')
                
        })
        .on('mousemove', (event) => {
            d3.select('#timeline-tooltip')
              .style('left', (event.pageX + 10) + 'px')   
              .style('top', (event.pageY + 10) + 'px')
          })
        .on('mouseleave', function() {
            d3.select('#timeline-tooltip').style('opacity', 0) //turn off the tooltip
                .style('left', '0px')   
                .style('top', '0px')
        })
        
        let brush_bars = vis.context.selectAll('.brush-bar')
            .data(vis.data)
            .enter()
            .append('rect');

        brush_bars.style('opacity', 0.5)
            .transition().duration(1000)
            .style('opacity', 1)
            .attr('class', 'brush-bar')
            .attr('x', d => vis.xScaleContext(vis.xValue(d)))
            .attr('width', vis.xScaleContext.bandwidth())
            .attr('height', d => (vis.config.contextHeight - vis.yScaleContext(vis.yValue(d))))
            .attr('y', d => vis.yScaleContext(vis.yValue(d)))


           

        // Update the axes
        vis.xAxisFocusG.call(vis.xAxisFocus);
        vis.yAxisFocusG.call(vis.yAxisFocus);
        vis.xAxisContextG.call(vis.xAxisContext);

        vis.brushG.call(vis.brush)



    
    }

    updateScale(data, selection) { 
        var tickScale = d3.scalePow().range([data.length / 10, 0]).domain([data.length, 0]).exponent(.5)
  
        let vis = this
        let brushValue = selection[1] - selection[0]

        if(brushValue === 0){
            brushValue = this.width;
        }
        // console.log(brushValue)

        var tickValueMultiplier = Math.ceil(Math.abs(tickScale(brushValue)));  
        // console.log(tickValueMultiplier)
        var filteredTickValues = data.filter(function(d, i){return i % tickValueMultiplier === 0}).map(function(d){ return d.year})
    
        // console.log(filteredTickValues)

        vis.focus.select(".axis.x-axis").call(vis.xAxisFocus.tickValues(filteredTickValues));
    }

    brushed(selection) {
        let vis = this;
            
        let filteredData = vis.data
  

        // Check if the brush is still active or if it has been removed
        if (selection) {
      
            // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
            var selectedDomain = vis.xScaleContext.domain()
                    .filter(function(d){
                        return (selection[0] <= vis.xScaleContext(d)) && (vis.xScaleContext(d) <= selection[1]);
                    });
       
            let min = Math.min(...selectedDomain)
            let max = Math.max(...selectedDomain)
          
            filteredData = vis.data
                .filter(function(d) {
                    return (d.year >= min) && (d.year <= max);
                });

           
            // Update x-scale of the focus view accordingly
            vis.xScaleFocus.domain(selectedDomain);

        } else {
            // Reset x-scale of the focus view (full time period)
            vis.xScaleFocus.domain(vis.xScaleContext.domain());
        }

        // Redraw line and update axis labels in focus view
        vis.yScaleFocus.domain([0,d3.extent(filteredData, vis.yValue)[1]]);
        vis.yAxisFocusG.call(vis.yAxisFocus)
        vis.xAxisFocus = vis.makeAxis(vis.xScaleFocus)
        vis.xAxisFocusG.call(vis.xAxisFocus);


       

        // Redraw timeline bars

        let timeline_bars = vis.focus.selectAll('.timeline-bar')
            .data(filteredData)
            .join('rect')
            .style('opacity', 0.5)
            .style('opacity', 1)
            .attr('class', 'timeline-bar')
            .attr('x', d => vis.xScaleFocus(vis.xValue(d)))
            .attr('width', vis.xScaleFocus.bandwidth())
            .attr('height', d => (vis.config.height - vis.yScaleFocus(vis.yValue(d))))
            .attr('y', d => vis.yScaleFocus(vis.yValue(d)))

            
        timeline_bars.on('mouseover', function(event, d) {
            d3.select('#timeline-tooltip')
                .style('opacity', 1)
                .style('z-index', 1000000)
                .html(`<div class="timeline-tooltip-label">Year: ${d.year}</br>Specimens collected: ${d.specimen_count}</div>`)
                .style('left', (event.pageX + 10) + 'px')   
                .style('top', (event.pageY + 10) + 'px')
                
        })
        .on('mousemove', (event) => {
            d3.select('#timeline-tooltip')
              .style('left', (event.pageX + 10) + 'px')   
              .style('top', (event.pageY + 10) + 'px')
          })
        .on('mouseleave', function() {
            d3.select('#timeline-tooltip').style('opacity', 0) //turn off the tooltip
                .style('left', '0px')   
                .style('top', '0px')
        })

    }
        
}