'use strict';

function toggleMenu(menu) {
  menu = menu || document.querySelector('#menu');
  menu.classList.toggle('open');
}

function toggleProposal(item) {
  var content = item.querySelector('.featurelist__item__info');
  var maxHeight = content.style.maxHeight;
  content.style.maxHeight = maxHeight ? '' : content.scrollHeight + 'px';
  content.setAttribute('aria-hidden', !!maxHeight);
  if (maxHeight) {
    content.setAttribute('tabindex', '-1');
  } else {
    content.removeAttribute('tabindex');
  }
  item.classList.toggle('open');
}

/**
 * Represents the start of this application
 */
function start() {
  var items = document.querySelectorAll(
    '.featurelist__item .featurelist__item__example'
  );

  document.body.classList.remove('no-js');

  items.forEach(function(v) {
    v.addEventListener('click', function() {
      toggleProposal(this.parentNode);
    });
    v.addEventListener('keypress', function(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        toggleProposal(this.parentNode);
      }
    });
  });

  document
    .querySelector('.menu-toggle')
    .addEventListener('click', function(ev) {
      ev.preventDefault();
      toggleMenu();
    });

  document.querySelectorAll('.menu-link').forEach(function(link) {
    var submenu = link.parentNode.querySelector('.submenu');
    if (submenu) {
      link.addEventListener('click', function(ev) {
        var t = link.parentNode.querySelector('.submenu-toggle');
        ev.preventDefault();
        toggleMenu(submenu);
        t.classList.toggle('open');
      });
    }
  });

  document.querySelectorAll('.submenu-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(ev) {
      var t = ev.target;
      var submenu = t.parentNode.querySelector('.submenu');
      toggleMenu(submenu);
      t.classList.toggle('open');
    });
  });
}

start();
