class BarChart{
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            width:  800,
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
            .attr('transform', 'translate(0,'+vis.config.height+')')
            .call(d3.axisBottom(vis.x))

        let maxArr = []

        vis.data.map(d => {
            maxArr.push(d.y_value)
        })

        vis.y = d3.scaleLinear()
            .domain([0, d3.max(maxArr)+100])
            .range([vis.config.height, 0]);
        vis.svg.append('g')
            .call(d3.axisLeft(vis.y));

        vis.svg.selectAll('bar')
            .data(vis.data)
            .join('rect')
                .attr('x', d => vis.x(d.x_value))
                .attr('y', d => vis.y(d.y_value))
                .attr('width', vis.x.bandwidth())
                .attr('height', d => vis.config.height - vis.y(d.y_value))
                .attr('fill', '#69b3a2')

    }
}