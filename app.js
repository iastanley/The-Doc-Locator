$(function(){

  displayDocResults();

  function displayDocResults(){
    var html = '';
    // dummy data for betterdoctor api
    var imgSrc = 'https://asset3.betterdoctor.com/assets/general_doctor_male.png';
    var name = 'Mallik' + ' ' + 'Thatipelli' + ' ' + 'MD';
    var specialty = 'Pediatrics';
    var description = 'California Vascular & Vein Center is founded and operated by Dr. Mallik Thatipelli, with a goal to offer comprehensive medical care to vascular and vein diseases. Established in 2010, our clinic provides minimally invasive, non-surgical treatment options for all vascular and venous problems. Dr. Thatipelli is fellowship trained in Vascular Medicine at the world renowned Mayo Clinic and board certified in Vascular Medicine, Endovascular Medicine and Phlebology. Our trained and experienced staff is committed to provide excellent care. We perform all of our varicose vein procedures in our office under minimal sedation with no downtime. Patients can walk home soon after the procedure completion and can resume normal activities. We also treat circulation problems such as PAD, HTN and, carotid stenosis. We offer comprehensive evaluation and definitive treatment for leg wounds for arterial and venous problems.';

    //loop to build each doctor card
    //loop will change slightly with real data
    for (var i = 0; i < 10; i++) {
      html += '<div class="doc-card">';
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


});
