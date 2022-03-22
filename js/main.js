


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

      d.year = +d.year;

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

    leafletMap = new LeafletMap({ parentElement: '#my-map'}, data);
    console.log(unmappedPoints);


  })
  .catch(error => console.error(error));
