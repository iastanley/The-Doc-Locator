var BETTER_DOCTOR_URL = 'https://api.betterdoctor.com/2016-03-01/doctors';
var map;
var mapCenter;

//google maps API callback function runs when script loads
function initMap() {
  specialtyOptions();
  var geocoder = new google.maps.Geocoder();

  //form event handler
  $('#search-form').submit(function(event){
    event.preventDefault();
    //switch to results view by changing header style
    $('header').removeClass('full-screen');
    //get input from user
    var userLocation = $('#user-input').val();

    //get optional filters from user
    var specialtyValue = $('#specialty').val();
    var genderValue = $('#gender').val();
    var acceptingValue = Boolean($('#newPatients:checked').val());
    var filter = createFilterObject(specialtyValue, genderValue, acceptingValue);

    //use geocoding to get location
    geocoder.geocode({'address': userLocation}, function(results, status){
      if (status == 'OK') {
        mapCenter = results[0].geometry.location;
        console.log(mapCenter.lat() + ',' + mapCenter.lng());
        //initialize the map with the user input location
        map = new google.maps.Map(document.getElementById('map'), {
          center: mapCenter,
          zoom: 8
        });
        //test data - delete for real version
        getBetterDoctorData(testData);
        //ajax call to betterdoctor API using locaiton as search query and filters
        // getBetterDoctorData(mapCenter, docDataCallback);
      } else {
        console.log('Geolocation service error: ' + status);
      }
    });
  });

  $('#results').on('click', '.expand', function(){
    toggleCard($(this).parent());
  });

  //betterdoctor API ajax call handler
  //this is the version for the final code
  // function getBetterDoctorData(location, callback) {
  //   //make ajax call to betterdoctor API
  //   var query = {
  //     user_key: '21117ecb33b4e4b1650558f7b9657e24',
  //     location: location.lat() + ',' + location.lng() + ',20',
  //     limit: 20
  //   }
  //   $.getJSON(BETTER_DOCTOR_URL, query, callback);
  // }

  //constructs filter object
  function createFilterObject(specialty, gender, accepting) {
    return {
      specialty: specialty,
      gender: gender,
      accepting: accepting
    }
  }

  //testData handler for betterdoctor API data
  //remove from final version
  function getBetterDoctorData(data) {
    docDataCallback(data);
  }

  //callback function for the betterdoctor API call
  function docDataCallback(data){
    //build html for results section
    displayDocResults(data);
    //get doctor locations and add markers to map
    displayMarkers(data);

  }

  //add marker data to map based on doctor locations
  function displayMarkers(data){
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
        marker.addListener('click', function(){
          var id = this.title;
          document.getElementById(id).scrollIntoView(true);
          selectCard($('#' + id));
        });
        bounds.extend(marker.getPosition());
      }
    }
    map.fitBounds(bounds);
  }

  function displayDocResults(data){
    //build html for doctor result cards
    var html = '<h3>Results</h3>';
    //create array of what we need
    var imgSrc;
    var name;
    var specialty;
    var description;
    var uid;
    //build html
    for (var i = 0; i < data.data.length; i++) {
      if (data.data[i].profile.image_url.indexOf('_female') !== -1) {
        imgSrc = 'https://asset3.betterdoctor.com/assets/general_doctor_male.png';
      } else {
        imgSrc = data.data[i].profile.image_url;
      }
      // imgSrc = data.data[i].profile.image_url ? data.data[i].profile.image_url : 'https://asset3.betterdoctor.com/assets/general_doctor_male.png';
      name = data.data[i].profile.first_name + ' '
            + (data.data[i].profile.middle_name || '') + ' '
            + data.data[i].profile.last_name + ', '
            + data.data[i].profile.title;
      if (data.data[i].specialties) {
        specialty = data.data[i].specialties[0].name;
      } else {
        specialty = '';
      }
      uid = data.data[i].uid;
      description = data.data[i].profile.bio;
      html += '<div class="doc-card" id="' + uid + '">';
      html += '<img src="' + imgSrc + '">';
      html += '<div class="min-description">';
      html += '<p><strong>Name: </strong>' + name + '</p>';
      html += '<p><strong>Specialty: </strong>' + specialty + '</p>';
      html += '</div>';
      html += '<div class="expanded-description"><p>' + description + '</div>';
      html += '<p class="expand"><i class="fa fa-chevron-down" aria-hidden="true"></i></p>';
      html += '</div>';
    }

    $('#results').html(html);

  }

  function specialtyOptions() {
    //hard coded for the moment
    //betterdoctor api offers
    var options = [
      {uid: "body-imaging-radiologist", name: "Body Imaging"},
      {uid: "clinical-pathologist", name: "Clinical Pathology"},
      {uid: "allergy-immunology-allergy", name: "Allergy & Immunology"},
      {uid: "dermatologist", name: "Dermatology"},
      {uid: "immunodermatologist", name: "Clinical & Laboratory Dermatological Immunology"}
    ];

    var html = '<option value="" selected disabled>Choose a Specialty</option>';
    for (var i = 0; i < options.length; i++) {
      html += '<option value="' + options[i].uid + '">';
      html += options[i].name;
      html += '</option>';
    }

    $('#specialty').html(html);
  }

  //FUNCTIONS FOR HANDLING CARD EXPAND/COLLAPSE AND SELECTION
  function toggleCard(card) {
    //if card is collapsed show
    if (card.find('i').attr('class') == 'fa fa-chevron-down') {
      card.find('i').attr('class', 'fa fa-chevron-up');
      card.find('.expanded-description').show();
    } else {
      card.find('i').attr('class', 'fa fa-chevron-down');
      card.find('.expanded-description').hide();
    }
  }

  function resetAllCards() {
    $('.doc-card').css('border', '1px solid black');
    $('.expand').find('i').attr('class', 'fa fa-chevron-down');
    $('.expanded-description').hide();
  }

  function selectCard(card) {
    resetAllCards();
    toggleCard(card);
    card.css('border', '1px solid red');
  }

}
