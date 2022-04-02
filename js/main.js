
let timelineData = [];


d3.csv('data/occurrences.csv')
.then(data => {
    let unmappedPoints = 0;
    data.forEach(d => {

      d.id = +d.id;

      // if coordinates are not present, set them to extremely high value 
      // this prevents the point from being visible on the map
      if(d.decimalLatitude == ""){
        d.decimalLatitude = 99999999;
        unmappedPoints += 1;
      } else {
        d.decimalLatitude = +d.decimalLatitude;
      }
      if(d.decimalLongitude == ""){
        d.decimalLongitude = 99999999;
      } else {
        d.decimalLongitude = +d.decimalLongitude;
      }

      // Phylum
      if(d.phylum == ""){
        d.phylum = "Unknown"
      }

      // DATE CONSTRUCTION
      if(d.month == ""){
          d.month = 0;
      } else {
          d.month = +d.month;
      }

      if (d.day == "") {
          d.day = 0;
      } else {
          d.day = +d.day;
      }

      d.year = parseInt(d.year);

      // TODO: if this is needed in project, make sure to check if value is -1 to parse out empty values
      if (d.startDayOfYear == "") {
        d.startDayOfYear = -1;
      } else {
          d.startDayOfYear = +d.startDayOfYear;
      }

      // create date object (mm/dd/yy) for map
      // check if month is present
      if ((d.month !== 0) && (d.day !== 0)) {
        d.eventDate = `${d.month}/${d.day}/${d.year}`;
      } 
      else if (d.month !== 0) {
        d.eventDate = `${d.month}/--/${d.year}`;
      }
      else {
        d.eventDate = `--/--/${d.year}`;
      }

      d.year = +d.year;

      d.latitude = +d.decimalLatitude;
      d.longitude = +d.decimalLongitude; 

      

    });

    let barChart1Data = []
    let barChart2Data = []
    let barChart3Data = []

    groups = d3.groups(data, d => d.year);
    monthGroups = d3.groups(data, d=> d.month)
    phylumGroups = d3.groups(data, d => d.phylum)
    collectedByGroups = d3.groups(data, d => d.recordedBy)

    console.log(monthGroups)
    console.log(groups)
    console.log(phylumGroups)
    console.log(collectedByGroups)

    groups.forEach(d=> {

      timelineData.push({"year": d[0] , "specimen_count": d3.selectAll(d[1]).size()});

    })

    monthGroups.forEach(d => {
      barChart1Data.push({
        'x_value': d[0], 
        'y_value': d3.selectAll(d[1]).size()
      })
    })

    phylumGroups.forEach(d => {
      barChart2Data.push({
        'x_value': d[0],
        'y_value': d3.selectAll(d[1]).size()
      })
    })

    collectedByGroups.forEach(d => {
      barChart3Data.push({
        'x_value': d[0],
        'y_value': d3.selectAll(d[1]).size()
      })
    })

    barChart1Data.sort(function(a,b) {
      return a.x_value - b.x_value
    })

    barChart3Data.sort(function(a,b) {
      return b.y_value - a.y_value
    })

    console.log(timelineData)
    console.log(barChart1Data)
    console.log(barChart3Data.slice(0, 11))

    leafletMap = new LeafletMap({ parentElement: '#my-map'}, data);
    console.log(unmappedPoints);

    timeline = new Timeline({parentElement: '#timeline'}, timelineData);
    timeline.updateVis();

    barChart1 = new BarChart({parentElement: '#barchart1', tooltipElement: '#barchart1-tooltip'}, barChart1Data);
    barChart2 = new BarChart({parentElement: '#barchart2', tooltipElement: '#barchart2-tooltip'}, barChart2Data);
    barChart3 = new BarChart({parentElement: '#barchart3', tooltipElement: '#barchart3-tooltip'}, barChart3Data.slice(0,11));


  })
  .catch(error => console.error(error));
