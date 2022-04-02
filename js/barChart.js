class BarChart{
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            tooltip: _config.tooltipElement,
            width:  810,
            height: 400,
            margin: {
                top: 10,
                right: 10,
                bottom: 100,
                left: 45
            },
            contextMargin: {top: 280, right: 10, bottom: 20, left: 45},
            contextHeight: 50
        }

        this.data = _data
        this.initVis()
    }

    initVis() {
        let vis = this;

        let containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right
        let containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom

        vis.xValue = d => d.x_value
        vis.yValue = d => d.y_value

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
                .attr('width', containerWidth)
                .attr('height', containerHeight)
            .append('g')
                .attr('transform',
                      'translate('+vis.config.left+','+vis.config.top+')');

        vis.x = d3.scaleBand()
            .range([0, vis.config.width])
            .domain(vis.data.map(vis.xValue))
            .padding(0.2);
        vis.svg.append('g')
            .attr('transform', 'translate(45,'+vis.config.height+')')
            .call(d3.axisBottom(vis.x))

        let maxArr = []

        vis.data.map(d => {
            maxArr.push(d.y_value)
        })

        vis.y = d3.scaleLinear()
            .domain([0, d3.max(maxArr)+100])
            .range([vis.config.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)   
            .ticks(25)
        vis.svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(45,0)')
            .call(vis.yAxis);

        vis.svg.selectAll('bar')
            .data(vis.data)
            .join('rect')
                .attr('x', d => vis.x(d.x_value))
                .attr('y', d => vis.y(d.y_value))
                .attr('width', vis.x.bandwidth())
                .attr('height', d => vis.config.height - vis.y(d.y_value))
                .attr('transform', 'translate(45,0)')
                .attr('fill', '#69b3a2')
                .on('mouseover', function(event,d) { 
                    //create a tool tip
                    d3.select(vis.config.tooltipElement)
                        .style('opacity', 1)
                        .style('z-index', 1000000)
                        .html(`<div class="barchart-tooltip-label">Specimens collected: ${d.y_value}</div>`)
                        .style('left', (event.pageX) + 'px')   
                        .style('top', (event.pageY) + 'px')
                        .on('mouseleave', function() {
                            d3.select(vis.config.tooltipElement).style('opacity', 0) //turn off the tooltip
                                .style('left', '0px')   
                                .style('top', '0px')
                        })
                  })          
    }
}