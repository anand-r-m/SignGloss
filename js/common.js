const NAV_LINKS = [
  { text: 'Home', href: 'index.html' },
  { text: 'About', href: 'about.html' },
  { text: 'Demo', href: 'demo.html' },
  { text: 'Operations', href: 'operations.html' },
  { text: 'Learn', href: 'learn.html' },
  { text: 'Team', href: 'team.html' },
];

function getCurrentPage() {
  var path = window.location.pathname;
  var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  return file;
}

function injectNavbar() {
  var placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  var currentPage = getCurrentPage();
  var linksHtml = '';

  NAV_LINKS.forEach(function(link) {
    var isActive = link.href === currentPage ? ' active' : '';
    linksHtml += '<li class="nav-item">' +
      '<a class="nav-link' + isActive + '" href="' + link.href + '">' + link.text + '</a>' +
      '</li>';
  });

  placeholder.innerHTML =
    '<nav class="navbar navbar-expand-lg sg-navbar fixed-top">' +
      '<div class="container">' +
        '<a class="navbar-brand" href="index.html">SignGloss</a>' +
        '<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#sg-nav" aria-controls="sg-nav" aria-expanded="false" aria-label="Toggle navigation">' +
          '<span class="navbar-toggler-icon"></span>' +
        '</button>' +
        '<div class="collapse navbar-collapse" id="sg-nav">' +
          '<ul class="navbar-nav ms-auto">' +
            linksHtml +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</nav>' +
    '<div style="height:68px"></div>';
}

function injectFooter() {
  var placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  placeholder.innerHTML =
    '<footer class="sg-footer">' +
      '<div class="container text-center">' +
        '<p>&copy; ' + new Date().getFullYear() + ' SignGloss — Real-time ISL to Gloss Translation</p>' +
      '</div>' +
    '</footer>';
}

function init() {
  injectNavbar();
  injectFooter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
