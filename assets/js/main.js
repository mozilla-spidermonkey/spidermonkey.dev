'use strict';

function generateColors(searchParams) {
  var primary = Math.round(360 * Math.random());
  var secondary = Math.round(360 * Math.random());
  var lightness = Math.round(100 * Math.random());
  searchParams.append("primary", primary);
  searchParams.append("secondary", secondary);
  searchParams.append("lightness", lightness);
  window.location.search = searchParams;
}

function clearColors(searchParams) {
  searchParams.delete("primary");
  searchParams.delete("secondary");
  searchParams.delete("lightness");
}

function generateLightness(lightness) {
  var secondary = ((lightness/2) + 75) % 100;
  var dim = ((lightness/5) + 75) % 100;
  var secondarydim = ((dim/2) + 75) % 100;
  return [secondary, dim, secondarydim]
}

function setColorsFromURL(searchParams) {
  var primary = searchParams.get("primary");
  var secondary = searchParams.get("secondary");
  var lightness = searchParams.get("lightness");

  var [secondarylight, dim, secondarydim] = generateLightness(lightness);

  var hslPrimary = `hsl(${primary}, 90%, ${lightness}%)`;
  var hslSecondary = `hsl(${secondary}, 90%, ${secondarylight}%)`;
  var hslPrimaryDim = `hsl(${primary}, 90%, ${dim}%)`;
  var hslSecondaryDim = `hsl(${secondary}, 90%, ${secondarydim}%)`;

  document.documentElement.style
  .setProperty('--color-primary', hslPrimary);
  document.documentElement.style
  .setProperty('--color-dim-primary', hslPrimaryDim);
  document.documentElement.style
  .setProperty('--color-dim-bg', hslSecondaryDim);
  document.documentElement.style
  .setProperty('--color-text', hslPrimary);
  document.documentElement.style
  .setProperty('--color-link', hslPrimary);
  document.documentElement.style
  .setProperty('--color-bg', hslSecondary);
  document.documentElement.style
  .setProperty('--color-logo-full', hslPrimary);
  document.documentElement.style
  .setProperty('--color-logo-1', hslSecondary);
  document.documentElement.style
  .setProperty('--color-logo-2', hslPrimary);

  var links = document.querySelectorAll("a")

  links.forEach(function(link) {
    if (link.href && link.href.includes(window.location.origin)) {
      var newLink = `${link.href}?primary=${primary}&secondary=${secondary}&lightness=${lightness}`;
      link.setAttribute('href', newLink);
    }
  })
}

document
.querySelector('.color-toggle')
.addEventListener('click', function(ev) {
  var searchParams = new URLSearchParams(location.search);
  if (searchParams.has("primary") === true) {
  clearColors(searchParams);
  }
  generateColors(searchParams);
});

document
.querySelector('.color-clear')
.addEventListener('click', function(ev) {
  var searchParams = new URLSearchParams(location.search);
  clearColors(searchParams);
  location.search = searchParams;
});

/**
 * Actions we want to take place after the page has finished loading
*/
window.addEventListener('DOMContentLoaded', function() {
  var searchParams = new URLSearchParams(location.search);
  if (searchParams.has("primary") === true) {
    setColorsFromURL(searchParams);
  }
});
