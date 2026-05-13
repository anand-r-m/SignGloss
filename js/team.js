document.querySelectorAll('.sg-team-card').forEach(function(card) {
  card.addEventListener('click', function() {
    var isExpanded = card.classList.contains('sg-card--expanded');
    document.querySelectorAll('.sg-team-card').forEach(function(c) {
      c.classList.remove('sg-card--expanded');
    });
    if (!isExpanded) {
      card.classList.add('sg-card--expanded');
    }
  });

  card.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

var starContainer = document.getElementById('star-rating');
var ratingInput = document.getElementById('rating-value');
var stars = starContainer.querySelectorAll('i');
var currentRating = 0;

function setStars(value) {
  currentRating = value;
  ratingInput.value = value;
  stars.forEach(function(star) {
    var starVal = parseInt(star.getAttribute('data-value'));
    if (starVal <= value) {
      star.classList.remove('bi-star');
      star.classList.add('bi-star-fill', 'filled');
    } else {
      star.classList.remove('bi-star-fill', 'filled');
      star.classList.add('bi-star');
    }
  });
}

stars.forEach(function(star) {
  star.addEventListener('click', function(e) {
    e.stopPropagation();
    setStars(parseInt(star.getAttribute('data-value')));
    document.getElementById('rating-feedback').style.display = 'none';
  });

  star.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setStars(parseInt(star.getAttribute('data-value')));
      document.getElementById('rating-feedback').style.display = 'none';
    }
  });
});

var form = document.getElementById('contact-form');
var nameInput = document.getElementById('contact-name');
var ageInput = document.getElementById('contact-age');
var qualInput = document.getElementById('contact-qualification');
var messageInput = document.getElementById('contact-message');
var successAlert = document.getElementById('contact-success');
var ratingFeedback = document.getElementById('rating-feedback');

function validateField(input, condition) {
  if (condition) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
  }
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  return false;
}

nameInput.addEventListener('input', function() {
  validateField(nameInput, nameInput.value.trim().length >= 2);
});

ageInput.addEventListener('input', function() {
  var val = parseInt(ageInput.value);
  validateField(ageInput, !isNaN(val) && val > 0);
});

qualInput.addEventListener('input', function() {
  validateField(qualInput, qualInput.value.trim().length > 0);
});

messageInput.addEventListener('input', function() {
  validateField(messageInput, messageInput.value.trim().length >= 10);
});

form.addEventListener('submit', function(e) {
  e.preventDefault();

  var nameOk = validateField(nameInput, nameInput.value.trim().length >= 2);
  var ageVal = parseInt(ageInput.value);
  var ageOk = validateField(ageInput, !isNaN(ageVal) && ageVal > 0);
  var qualOk = validateField(qualInput, qualInput.value.trim().length > 0);
  var msgOk = validateField(messageInput, messageInput.value.trim().length >= 10);
  var ratingOk = currentRating >= 1;

  if (!ratingOk) {
    ratingFeedback.style.display = 'block';
  } else {
    ratingFeedback.style.display = 'none';
  }

  if (nameOk && ageOk && qualOk && msgOk && ratingOk) {
    successAlert.classList.remove('d-none');
    form.reset();
    setStars(0);
    [nameInput, ageInput, qualInput, messageInput].forEach(function(el) {
      el.classList.remove('is-valid', 'is-invalid');
    });
    setTimeout(function() {
      successAlert.classList.add('d-none');
    }, 5000);
  }
});
