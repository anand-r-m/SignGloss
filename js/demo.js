var video = document.getElementById('demo-video');
var placeholder = document.getElementById('demo-placeholder');

video.addEventListener('canplay', function() {
  video.classList.remove('d-none');
  placeholder.classList.add('d-none');
});

video.addEventListener('error', function() {
  video.classList.add('d-none');
  placeholder.classList.remove('d-none');
});
