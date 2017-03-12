var BETTER_DOCTOR_URL = 'https://api.betterdoctor.com/2016-03-01/doctors';
var map;
var docLocations = [];

//google maps API callback function runs when script loads
function initMap() {
  specialtyOptions();

  //form event handler
  $('#search-form').submit(function(event){
    event.preventDefault();
    //switch to results view by changing header style
    $('header').removeClass('full-screen');
    //store location from google maps search - hard coded temporarily
    var mapCenter = {lat: 37.7575408, lng: -122.4574279};
    //initialize the map with the user input location
    map = new google.maps.Map(document.getElementById('map'), {
      center: mapCenter,
      zoom: 8
    });
    //ajax call to betterdoctor API using locaiton as search query and filters
    getBetterDoctorData(mapCenter, docDataCallback);

    //test data - delete for real version
    // getBetterDoctorData(testData);

  });

  //betterdoctor API ajax call handler
  //this is the version for the final code
  function getBetterDoctorData(location, callback) {
    //make ajax call to betterdoctor API
    var query = {
      user_key: '21117ecb33b4e4b1650558f7b9657e24',
      location: location.lat + ',' + location.lng + ',20',
      limit: 20
    }
    $.getJSON(BETTER_DOCTOR_URL, query, callback);
  }

  //testData handler for betterdoctor API data
  //remove from final version
  // function getBetterDoctorData(data) {
  //   docDataCallback(data);
  // }

  //callback function for the betterdoctor API call
  function docDataCallback(data){
    //get doctor locations and add markers to map
    getDocLocations(data);
    //build html for results section
    displayDocResults(data);
  }

  //add marker data to map based on doctor locations
  function getDocLocations(data){
    //bounds object needed to fit all markers in map zoomed view
    var bounds = new google.maps.LatLngBounds();
    //loop through each doctor in data object
    for (var i = 0; i < data.data.length; i++) {
      //loop through each practice for a particular doctor
      for (var j = 0; j < data.data[i].practices.length; j++) {
        //add marker to map
        var marker = new google.maps.Marker({
          position: {
            lat: data.data[i].practices[j].lat,
            lng: data.data[i].practices[j].lon
          },
          map: map,
          title: data.data[i].uid
        });
        bounds.extend(marker.getPosition());
      }
    }
    map.fitBounds(bounds);
  }

  function displayDocResults(data){
    //build html for doctor result cards
    var html = '';
    //create array of what we need
    var imgSrc;
    var name;
    var specialty;
    var description;
    var uid;
    //build html
    for (var i = 0; i < data.data.length; i++) {
      try {
        imgSrc = data.data[i].profile.image_url;
      } catch(error) {
        imgSrc = 'https://asset3.betterdoctor.com/assets/general_doctor_male.png';
      }
      // imgSrc = data.data[i].profile.image_url ? data.data[i].profile.image_url : 'https://asset3.betterdoctor.com/assets/general_doctor_male.png';
      name = data.data[i].profile.first_name + ' '
            + (data.data[i].profile.middle_name || '') + ' '
            + data.data[i].profile.last_name + ', '
            + data.data[i].profile.title;
      specialty = data.data[i].specialties[0].name;
      uid = data.data[i].uid;
      description = data.data[i].profile.bio;
      html += '<div class="doc-card" id="' + uid + '">';
      html += '<img src="' + imgSrc + '">';
      html += '<div class="min-description">';
      html += '<p><strong>Name: </strong>' + name + '</p>';
      html += '<p><strong>Specialty: </strong>' + specialty + '</p>';
      html += '</div>';
      html += '<div class="expanded-description"><p>' + description + '</div>';
      html += '<p id="expand">Learn More</p>';
      html += '</div>';
    }

    $('#results').append(html);

  }

  function specialtyOptions() {
    //hard coded for the moment
    //betterdoctor api offers
    var options = [
      {uid: "body-imaging-radiologist", name: "Body Imaging"},
      {uid: "clinical-pathologist", name: "Clinical Pathology"},
      {uid: "allergy-immunology-allergy", name: "Allergy & Immunology"},
      {uid: "dermatologist", name: "Dermatology"},
      {uid: "immunodermatologist", name: "Cliniccal & Laboratory Dermatological Immunology"}
    ];

    var html = '';
    for (var i = 0; i < options.length; i++) {
      html += '<option value="' + options[i].uid + '">';
      html += options[i].name;
      html += '</option>';
    }

    $('#specialty').html(html);
  }

}
