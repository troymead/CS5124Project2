


d3.csv('data/occurrences.csv')
.then(data => {
    data.forEach(d => {
      d.id = +d.id

      if(d.decimalLatitude == "null"){
        d.decimalLatitude = 99999999
      }
      if(d.decimalLongitude == "null"){
        d.decimalLongitude = 99999999
      }

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

      if(d.year == "null" || d.year == ""){
        console.log(d.eventDate)
        let date = new Date(d.eventDate) 
        console.log(date.getFullYear())
        if(!date.getFullYear()){
          // TODO parse string for year and month
          // d.year = d.eventDate
          // d.month = d.eventDate
        }
      }

      d.year = +d.year;

      d.latitude = +d.decimalLatitude;
      d.longitude = +d.decimalLongitude; 

    });

    leafletMap = new LeafletMap({ parentElement: '#my-map'}, data);


  })
  .catch(error => console.error(error));
