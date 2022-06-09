"use strict;";

// selects single element
/**
 *
 * This function returns first the child element of the parent element with the given selector
 * @param {*} selector It contains a string presenting a tag, class or id of the element that needs to be selected
 * @param {*} [parentElem=document] It contains the reference to the element where to search for the child elements
 */
const $first = (selector, parentElem = document) =>
  parentElem.querySelector(selector);

/**
 *
 * This function returns all the child elements of the parent element with the given selector
 * @param {*} selector It contains a string presenting a tag, class or id of the element that needs to be selected
 * @param {*} [parentElem=document] It contains the reference to the element where to search for the child elements
 */
const $all = (selector, parentElem = document) =>
  parentElem.querySelectorAll(selector);

/************************
 *  querySelector functions end
 */
