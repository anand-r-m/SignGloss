var cards = document.querySelectorAll('.sg-team-card');
var overlay = document.getElementById('team-card-overlay');
var overlayContent = document.getElementById('team-overlay-content');
var overlayClose = document.getElementById('team-overlay-close');

cards.forEach(function(card) {
  card.addEventListener('click', function() {
    var expandContent = card.querySelector('.sg-card-expand-content');
    if (!expandContent || !overlay) return;

    overlayContent.innerHTML = '';
    var header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '1.5rem';

    var photo = card.querySelector('.sg-team-photo');
    if (photo) {
      var photoClone = photo.cloneNode(true);
      photoClone.style.width = '100px';
      photoClone.style.height = '100px';
      header.appendChild(photoClone);
    }

    var name = card.querySelector('.sg-team-name');
    if (name) {
      var nameClone = name.cloneNode(true);
      header.appendChild(nameClone);
    }

    var role = card.querySelector('.sg-team-role');
    if (role) {
      var roleClone = role.cloneNode(true);
      header.appendChild(roleClone);
    }

    overlayContent.appendChild(header);

    var contentClone = expandContent.cloneNode(true);
    contentClone.style.maxHeight = 'none';
    contentClone.style.overflow = 'visible';
    overlayContent.appendChild(contentClone);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  card.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

if (overlayClose) {
  overlayClose.addEventListener('click', function() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });
}

if (overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

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
