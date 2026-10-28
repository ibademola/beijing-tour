// ======================================================
// PHOTO DATA
// Information about each photograph and its location
// ======================================================

const photos = [

    {
        title: "Beijing Olympic Stadium",
        image: "images/Beijing Olympic Stadium.jpeg",
        longitude: 116.3906,
        latitude: 39.9913,
        x: 447975.03,
        y: 4426969.42
    },

    {
        title: "Chinese Archaeological Museum",
        image: "images/Chinese Archaeological Museum.jpeg",
        longitude: 116.3795,
        latitude: 40.0005,
        x: 447034.51,
        y: 4427997.07
    },

    {
        title: "Beijing Olympic Tower",
        image: "images/Beijing Olympic Tower.jpeg",
        longitude: 116.3930,
        latitude: 40.0105,
        x: 448194.43,
        y: 4429099.05
    },

    {
        title: "Beijing Street View",
        image: "images/Beijing Street View.jpeg",
        longitude: 116.4010,
        latitude: 39.9950,
        x: 448865.65,
        y: 4427374.07
    }

];



// ======================================================
// CONNECT TO THE ARCGIS MAPS SDK
// ======================================================

const [Map, MapView, Graphic] = await $arcgis.import([
    "@arcgis/core/Map.js",
    "@arcgis/core/views/MapView.js",
    "@arcgis/core/Graphic.js"
]);



// ======================================================
// CREATE THE WEB MAP
// ======================================================

const map = new Map({

    basemap: "streets-vector"

});



// ======================================================
// DISPLAY THE MAP ON THE WEBPAGE
// ======================================================

const view = new MapView({

    container: "map",

    map: map,

    center: [116.39, 40.00],

    zoom: 13

});



// ======================================================
// ADD PHOTO LOCATIONS TO THE MAP
// Each photograph is represented by a red point
// ======================================================

photos.forEach(function(photo, index) {

    const marker = new Graphic({

        // Location of the photograph
        geometry: {

            type: "point",

            longitude: photo.longitude,

            latitude: photo.latitude

        },


        // Appearance of the location marker
        symbol: {

            type: "picture-marker",
            url: "images/location-pin.png",
            width: "24px",
            height: "32px",

            color: "white",

            size: 18,

            outline: {

                color: "red",

                width: 2

            }

        },


        // Connect the marker to its photograph
        attributes: {

            photoIndex: index,

            title: photo.title

        }

    });


    // Add the marker to the map
    view.graphics.add(marker);

});



// ======================================================
// CREATE THE PHOTO GALLERY
// Display the photographs at the bottom of the webpage
// ======================================================

const gallery = document.getElementById("gallery");


photos.forEach(function(photo, index) {

    // Create a thumbnail
    const image = document.createElement("img");


    // Use the photograph as the thumbnail
    image.src = photo.image;


    // Apply our CSS thumbnail style
    image.className = "thumbnail";


    // Display the photograph when thumbnail is clicked
    image.onclick = function() {

        showPhoto(index);

    };


    // Add thumbnail to the gallery
    gallery.appendChild(image);

});



// ======================================================
// DISPLAY A SELECTED PHOTO
// Used when either a map location or thumbnail is selected
// ======================================================

function showPhoto(index) {

    const photo = photos[index];


    // Display the selected photograph
    document.getElementById("selected-photo").src =
        photo.image;


    // Display the name of the location
    document.getElementById("photo-title").textContent =
        photo.title;


    // Find all thumbnails
    const thumbnails =
        document.querySelectorAll(".thumbnail");


    // Remove the selected style from all thumbnails
    thumbnails.forEach(function(thumbnail) {

        thumbnail.classList.remove("selected");

    });


    // Highlight the selected thumbnail
    thumbnails[index].classList.add("selected");

}



// ======================================================
// RESPOND WHEN A PHOTO LOCATION IS CLICKED ON THE MAP
// ======================================================

view.on("click", async function(event) {

    // Look only for our red photo markers
    const response = await view.hitTest(event, {
        include: view.graphics
    });


    // Check whether a marker was clicked
    if (response.results.length > 0) {

        const result = response.results[0];

        // Get the photograph connected to the marker
        const index = result.graphic.attributes.photoIndex;

        // Display the photograph
        showPhoto(index);

    }

});


// ======================================================
// DISPLAY THE FIRST PHOTO WHEN THE APP OPENS
// ======================================================

showPhoto(0);

// ======================================================
// COLLAPSE AND EXPAND THE PHOTO GALLERY
// ======================================================

const gallerySection =
    document.getElementById("gallery-section");

const galleryToggle =
    document.getElementById("gallery-toggle");


galleryToggle.onclick = function() {

    gallerySection.classList.toggle("collapsed");

};

// ======================================================
// CALCULATE DISTANCE BETWEEN ANY TWO EXISTING LOCATIONS
// All X/Y values use WGS 84 / UTM zone 50N (EPSG:32650), meters.
// ======================================================

const point1Select = document.getElementById("point1");
const point2Select = document.getElementById("point2");

// Create dropdown options using our existing photo data.
photos.forEach(function(photo, index) {
    const option1 = document.createElement("option");
    option1.value = index;
    option1.textContent = photo.title;
    point1Select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = index;
    option2.textContent = photo.title;
    point2Select.appendChild(option2);
});

// Start with the stadium and museum selected.
point1Select.value = "0";
point2Select.value = "1";

document.getElementById("distance-btn").onclick = function() {
    const point1 = photos[Number(point1Select.value)];
    const point2 = photos[Number(point2Select.value)];

    if (point1 === point2) {
        document.getElementById("distance-result").textContent =
            "Please select two different locations.";
        return;
    }

    // Difference between UTM eastings (X) and northings (Y).
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;

    // Pythagorean theorem: straight-line planar distance in meters.
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    console.log(point1.title, "to", point2.title, distance.toFixed(2), "meters");

    document.getElementById("distance-result").textContent =
        "Distance: " + distance.toFixed(2) + " meters (" +
        (distance / 1000).toFixed(3) + " km)";
};
