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

function randomColor(saturationPercent = 100, lightnessPercent = 100) {
  return "hsl(" + 360 * Math.random() + ',' +
          (saturationPercent * Math.random()) + '%,' + 
          (lightnessPercent * Math.random()) + '%)'
}

function getCookie(cname) {
  var cookies = document.cookie.split(";");
  for(var i = 0; i < cookies.length; i++) {
    var myCookie = cookies[i].split("=");
    if(cname == myCookie[0].trim()) {
      return myCookie[1];
    }
  }
  return null;
}

function setCookie(cname, value) {
  document.cookie = cname + "=" + value + ";path=/;SameSite=Strict;"
}

function generateColorsCookie() {
  document.cookie = setCookie("color-cookie", "true");
  document.cookie = setCookie("color-primary", randomColor(90, 90));
  document.cookie = setCookie("color-secondary", randomColor(54, 50));
  document.cookie = setCookie("color-tertiary", randomColor());
}

function setFromColorsCookie() {
  document.documentElement.style
    .setProperty('--color-primary', getCookie("color-primary"));
  document.documentElement.style
    .setProperty('--color-dim-primary', getCookie("color-tertiary"));
    document.documentElement.style
    .setProperty('--color-dim-bg', 0.8 * getCookie("color-secondary") + 2.0);
  document.documentElement.style
    .setProperty('--color-text', getCookie("color-primary"));
  document.documentElement.style
    .setProperty('--color-link', getCookie("color-primary"));
  document.documentElement.style
    .setProperty('--color-bg', getCookie("color-secondary"));
  document.documentElement.style
    .setProperty('--color-logo-full', getCookie("color-primary"));
  document.documentElement.style
    .setProperty('--color-logo-1', getCookie("color-secondary"));
  document.documentElement.style
    .setProperty('--color-logo-2', getCookie("color-primary"));
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

  window.addEventListener('DOMContentLoaded', function() {
    if (getCookie("color-cookie") == "true") {
      setFromColorsCookie();
    }
  });

  document
    .querySelector('.color-toggle')
    .addEventListener('click', function(ev) {
      generateColorsCookie();
      setFromColorsCookie();
      location.reload();
  });

  document
    .querySelector('.color-clear')
    .addEventListener('click', function(ev) {
      setCookie("color-cookie", "false");
      location.reload();
  });
}

start();
