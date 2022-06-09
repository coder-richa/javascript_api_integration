const updateContent = (element, content) => {
  element.innerHTML = content;
};
const checkHidden = (elm) => window.getComputedStyle(elm).display === "none";
const updateVisibility = (elem, display_status) => {
  elem.style.display = display_status;
};

const toggleElement = (element) => {
  if (checkHidden(element)) {
    updateVisibility(element, "block");
  } else {
    updateVisibility(element, "none");
  }
};

const showElement = (element) => {
  element.style.display = "block";
};

const hideElement = (element) => {
  element.style.display = "none";
};

const hideSections = (sections) => {
  [...sections].forEach((section) => {
    hideElement(section);
  });
};

const showSections = (sections) => {
  [...sections].forEach((section) => {
    showElement(section);
  });
};
