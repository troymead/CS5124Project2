// Adapted from Tutorial 10 in data vis class

class LeafletMap {
  
  constructor(_config, _data) {

    this.config = {
      parentElement: _config.parentElement,
    }
    this.data = _data;
    this.initVis();
  }
  
  initVis() {
    let vis = this;

    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    vis.topoUrl ='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

    vis.stUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    vis.stAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    vis.base_layer = L.tileLayer(vis.esriUrl, {
      id: 'esri-image',
      attribution: vis.esriAttr,
      ext: 'png'
    });

    vis.topo_layer = L.tileLayer(vis.topoUrl, {
      id: 'topo-image',
      attribution: vis.topoAttr,
      ext: 'png'
    });

    vis.st_layer = L.tileLayer(vis.stUrl, {
      id: 'st-image',
      attribution: vis.stAttr,
      ext: 'png'
    });

    vis.theMap = L.map('my-map', {
      center: [30, 0],
      zoom: 2,
      layers: [vis.base_layer]
    });

    let colorScale = d3.scaleSequential()
      .interpolator(d3.interpolatePlasma)
      .domain(d3.extent(vis.data, d=>d.year));
    

    // Add functionality to the color by dropdown
    let options = [{"name":"Year","value":"year"},{"name":"Start Day of Year","value":"startDayOfYear"},{"name":"Phylum","value":"phylum"}]

    d3.select("#mapSelect")
        .selectAll('myOptions')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) { 
          return d["name"]; }) // text showed in the menu
        .attr("value", function (d) { return d["value"]; }) // corresponding value returned by the button

    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

    // Add radio buttons for different layers
    var baseLayers = {
        "Aerial": vis.base_layer,
        "Topography": vis.topo_layer,
        "Roads": vis.st_layer
    };

    var layers_options = {
      "collapsed": false
    }

    L.control.layers(baseLayers,{},layers_options).addTo(vis.theMap);


    //these are the city locations, displayed as a set of dots 
    vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.data) 
                    .join('circle')
                        .attr("fill", d => colorScale(d.year)) 
                        .attr("stroke", "black")
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
                        .attr("r", 3)
                        .on('mouseover', function(event,d) { 
                            //create a tool tip
                            d3.select('#tooltip')
                                .style('opacity', 1)
                                .style('z-index', 1000000)
                                .html(`<div class="tooltip-label">Date: ${d.eventDate}<br>Collected by: ${d.recordedBy}<br>Classification: ${d.scientificName}<br>Habitat & Substrate Notes: ${d.habitat}, ${d.substrate}<br>Link: <a href="${d.references}">${d.references}</a></div>`)
                                .style('left', (event.pageX) + 'px')   
                                .style('top', (event.pageY) + 'px')
                                .on('mouseleave', function() {
                                    d3.select('#tooltip').style('opacity', 0) //turn off the tooltip
                                        .style('left', '0px')   
                                        .style('top', '0px')
                                })
                          })          


    // Create the legend
    // https://d3-legend.susielu.com/
    var legend = d3.select("#legend");

    var svg = legend.append("svg")
        .attr('width', '200')
        .attr('height', '400');

    svg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(20,20)");

    var legendSequential = d3.legendColor()
        .shapeWidth(30)
        .cells(10)
        .scale(colorScale) 
        .labelFormat(d3.format(".0f"))

    legend.select(".legendSequential")
        .call(legendSequential);
                  
                      
    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });

    // A function that update the chart
    function update(selectedGroup) {

      switch(selectedGroup){
        case "year":
          colorScale = d3.scaleSequential()
              .interpolator(d3.interpolatePlasma)
          
          colorScale.domain(d3.extent(vis.data, d=>d[selectedGroup]));

          // Update legend
          var legendSequential = d3.legendColor()
              .shapeWidth(30)
              .cells(10)
              .scale(colorScale)
              .labelFormat(d3.format(".0f")) 
          break;
        case "startDayOfYear":
          colorScale = d3.scaleSequential()
              .interpolator(d3.interpolatePlasma) 

          colorScale.domain(d3.extent(vis.data, d=>d[selectedGroup]));

          // Update legend
          var legendSequential = d3.legendColor()
              .shapeWidth(30)
              .cells(10)
              .scale(colorScale) 
          break;
        case "phylum":
          colorScale = d3.scaleOrdinal(d3.schemeCategory10)
          colorScale.domain(vis.data.map(d => d[selectedGroup]))

          // Update legend
          var legendSequential = d3.legendColor()
              .shapeWidth(30)
              .cells(10)
              .scale(colorScale) 
          break;
      }
            
      legend.select(".legendSequential")
          .call(legendSequential);

      // Update the color of dots
      vis.Dots.attr("fill", d => colorScale(d[selectedGroup]))

    }

    d3.select("#mapSelect").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        console.log(selectedOption)
        // run the updateChart function with this selected option
        update(selectedOption)
    })

  }

  



  updateVis() {
    let vis = this;

    vis.radiusSize = 3; 
   
   //redraw based on new zoom- need to recalculate on-screen position
    vis.Dots
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y)
      .attr("r", vis.radiusSize) ;

  }


  renderVis() {
    let vis = this;

    //not using right now... 
 
  }
}