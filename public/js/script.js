window.initMap = function () {
  const location = { lat: 28.6139, lng: 77.2090 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: location,
  });

  new google.maps.Marker({
    position: location,
    map: map,
  });
};