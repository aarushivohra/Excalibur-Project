var clearances = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-84.47426, 38.06673],
            },
            properties: {
                clearance: "13' 2",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-84.47208, 38.06694],
            },
            properties: {
                clearance: "13' 7",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-84.60485, 38.12184],
            },
            properties: {
                clearance: "13' 7",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-84.61905, 37.87504],
            },
            properties: {
                clearance: "12' 0",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-84.55946, 38.30213],
            },
            properties: {
                clearance: "13' 6",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-84.27235, 38.04954],
            },
            properties: {
                clearance: "13' 6",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-84.27264, 37.82917],
            },
            properties: {
                clearance: "11' 6",
            },
        }
    ],
};

var obstacle = turf.buffer(clearances, 0.25, { units: "kilometers" });

map.on("load", function (e) {

    map.addLayer({
        id: "clearances",
        type: "fill",
        source: {
            type: "geojson",
            data: obstacle,
        },
        layout: {},
        paint: {
            "fill-color": "#f03b20",
            "fill-opacity": 0.5,
            "fill-outline-color": "#f03b20",
        },
    });


    for (i = 0; i <= 2; i++) {
        map.addSource("route" + i, {
            type: "geojson",
            data: {
                type: "Feature",
            },
        });

        map.addLayer({
            id: "route" + i,
            type: "line",
            source: "route" + i,
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": "#cccccc",
                "line-opacity": 0.5,
                "line-width": 13,
                "line-blur": 0.5,
            },
        });
    }

});

var nav = new mapboxgl.NavigationControl();

var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: "metric",
    profile: "mapbox/driving",
    alternatives: "true",
    geometries: "geojson",
});

map.scrollZoom.enable();
map.addControl(directions, "top-right");



directions.on("route", (e) => {
    var reports = document.getElementById("reports");
    reports.innerHTML = "";
    var report = reports.appendChild(document.createElement("div"));
    let routes = e.route;

    //Hide all routes by setting the opacity to zero.
    for (i = 0; i < 3; i++) {
        map.setLayoutProperty("route" + i, "visibility", "none");
    }

    routes.forEach(function (route, i) {
        route.id = i;
    });

    routes.forEach((e) => {
        //Make each route visible, by setting the opacity to 50%.
        map.setLayoutProperty("route" + e.id, "visibility", "visible");

        //Get GeoJson LineString feature of route
        var routeLine = polyline.toGeoJSON(e.geometry);

        //Update the data for the route, updating the visual.
        map.getSource("route" + e.id).setData(routeLine);

        var collision = "";
        var emoji = "";
        var clear = turf.booleanDisjoint(obstacle, routeLine);

        if (clear == true) {
            collision = "is good!";
            detail = "does not go";
            emoji = "✔️";
            report.className = "item";
            map.setPaintProperty("route" + e.id, "line-color", "#74c476");
        } else {
            collision = "is bad.";
            detail = "goes";
            emoji = "⚠️";
            report.className = "item warning";
            map.setPaintProperty("route" + e.id, "line-color", "#de2d26");
        }

        //Add a new report section to the sidebar.
        // Assign a unique `id` to the report.
        report.id = "report-" + e.id;

        // Add the response to the individual report created above.
        var heading = report.appendChild(document.createElement("h3"));

        // Set the class type based on clear value.
        if (clear == true) {
            heading.className = "title";
        } else {
            heading.className = "warning";
        }

        heading.innerHTML = emoji + " Route " + (e.id + 1) + " " + collision;

        // Add details to the individual report.
        var details = report.appendChild(document.createElement("div"));
        details.innerHTML = "This route " + detail + " through an avoidance area.";
        report.appendChild(document.createElement("hr"));
    });
});