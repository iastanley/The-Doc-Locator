var BETTER_DOCTOR_URL = 'https://api.betterdoctor.com/2016-03-01/doctors';
var map;
var mapCenter;

//google maps API callback function runs when script loads
function initMap() {
  specialtyOptions(specialtyList.data);
  var geocoder = new google.maps.Geocoder();

  //form event handler
  $('#search-form').submit(function(event){
    event.preventDefault();
    //switch to results view
    $('header').removeClass('full-screen');
    $('#results').show();
    $('#map').show();
    //get input from user
    var userLocation = $('#user-input').val();
    //get optional filters from user
    var specialtyValue = $('#specialty').val();
    var genderValue = $('#gender').val();
    var filter = createFilterObject(specialtyValue, genderValue);

    //use geocoding to get location
    geocoder.geocode({'address': userLocation}, function(results, status){
      if (status == 'OK') {
        mapCenter = results[0].geometry.location;
        //initialize the map with the user input location
        map = new google.maps.Map(document.getElementById('map'), {
          center: mapCenter,
          zoom: 8
        });
        //ajax call to betterdoctor API using locaiton as search query and filters
        // getBetterDoctorData(mapCenter, filter, docDataCallback);

        //******** test data - delete for real version *******
        getBetterDoctorData(testData);
      } else {
        console.log('Geolocation service error: ' + status);
      }
    });
  });

  $('#results').on('click', '.expand', function(){
    toggleCard($(this).parent());
  });

  //testData handler for betterdoctor API data
  //remove from final version
  function getBetterDoctorData(data) {
    docDataCallback(data);
  }

  //betterdoctor API ajax call handler
  //this is the version for the final code
  // function getBetterDoctorData(location, filter, callback) {
    //make ajax call to betterdoctor API
  //   var query = {
  //     user_key: '21117ecb33b4e4b1650558f7b9657e24',
  //     location: location.lat() + ',' + location.lng() + ',20',
  //     limit: 20
  //   }
  //
  //   if (filter.specialty) {
  //     query.specialty_uid = filter.specialty;
  //   }
  //
  //   if (filter.gender) {
  //     query.gender = filter.gender;
  //   }
  //
  //   $.getJSON(BETTER_DOCTOR_URL, query, callback);
  // }

  //constructs filter object
  function createFilterObject(specialty, gender) {
    return {
      specialty: specialty,
      gender: gender
    }
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
          title: data.data[i].profile.first_name + ' '
                + (data.data[i].profile.middle_name || '') + ' '
                + data.data[i].profile.last_name + ', '
                + data.data[i].profile.title,
          lookUp: data.data[i].uid
        });
        marker.addListener('click', function(){
          var id = this.lookUp;
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

  function specialtyOptions(list) {
    //sort list
    var list = list.sort(function(first, second) {
      var name1 = first.name.toUpperCase();
      var name2 = second.name.toUpperCase();
      if (name1 < name2) {
        return -1;
      }
      if (name1 > name2) {
        return 1;
      }
      return 0;

    });

    var html = '<option value="" selected disabled>Choose a Specialty</option>';
    html += '<option value="">All Specialties</option>';
    for (var i = 0; i < list.length; i++) {
      html += '<option value="' + list[i].uid + '">';
      html += list[i].name;
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
