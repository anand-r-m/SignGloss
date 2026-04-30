const video = document.getElementById('demo-video');
const placeholder = document.getElementById('demo-placeholder');

video.addEventListener('canplay', () => {
  video.classList.remove('d-none');
  placeholder.classList.add('d-none');
});

video.addEventListener('error', () => {
  video.classList.add('d-none');
  placeholder.classList.remove('d-none');
});
