d3.csv()
.then(data => {
    data.forEach(d => {
        d.id = +d.id;
        d.taxonID = +d.taxonID;
        d.year = +d.year;
        if (d.month == '') {
            d.month = null;
        } else {
            d.month = +d.month;
        }
        if (d.day == '') {
            d.month = null;
        } else {
            d.day = +d.day;
        }
    })
})
.catch(error => console.error(error));