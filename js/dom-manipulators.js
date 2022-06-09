"use strict;";
// Updates the DOM to by updating the content of the given element
const updateContent = (element, content) => {
  element.innerHTML = content;
};

// Makes element visible on the DOM
const showElement = (element) => {
  element.style.display = "block";
};

// Makes element hidden on the DOM
const hideElement = (element) => {
  element.style.display = "none";
};

// Makes elements visible on the DOM
const hideSections = (sections) => {
  [...sections].forEach((section) => {
    hideElement(section);
  });
};

// Makes elements hidden on the DOM
const showSections = (sections) => {
  [...sections].forEach((section) => {
    showElement(section);
  });
};
