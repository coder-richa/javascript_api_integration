"use strict;";
/**
 *  Element Selectors
 */

const searchForm = $first("#search-form");
const startDateTxt = $first("#start_date");
const endDateTxt = $first("#end_date");
const searchDataSections = $all(".search-data");
const usdCADRateDiv = $first("#usd_cad_rate_div");
const corraRateDiv = $first("#corra_rate_div");

const errorMessageLbl = $first("#error-message");

const errorAlert = $first(".form-alert-failure");
const successAlert = $first(".form-alert-success");

const searchBtn = $first("#search-button");
const resetBtn = $first("#search-reset");

// Function to format decimal numbers
const formatFloat = (value) => parseFloat(value).toFixed(4);

// Function to reset search data tables and hide the error message
const resetSearchData = ({ clearFormFields = true }) => {
  hideElement(errorAlert);
  hideElement(successAlert);
  hideSections(searchDataSections);

  // Resetting the form fields is required to clear the form
  if (clearFormFields) {
    startDateTxt.value = "";
    endDateTxt.value = "";
  }
};

// API URL Generator
const getAPIURL = (rateType, startDate, endDate) => {
  return `https://www.bankofcanada.ca/valet/observations/${rateType}/json?start_date=${startDate}&end_date=${endDate}`;
};

// Fetching data from API and creating the rate values array
const fetchRates = async (url, parameterName = "AVG.INTWO") => {
  /**
   *  Fetching Data from API and processing it
   */

  const method = `get`;
  // Get API Response
  const response = await getResponseJSON({
    url,
    body: new FormData(),
    method,
    mode: "cors",
  });
  // Check if the response is successful and has data
  const success = (response?.observations ?? []).length > 0;
  const message = success
    ? "Data Fetched successfully"
    : "Something went wrong";
  const values = [];

  // Processing the data on successful response
  if (success) {
    const observations = response?.observations ?? [];
    observations.forEach((observation) => {
      // Push values in array
      values.push(Number(observation[parameterName]?.v ?? 0));
    });
  }
  // Return the response
  return { success, message, values };
};

// Make a request to the APIs and retrieve the data
const fetchData = async (startDate, endDate) => {
  /**
   *  Fetching Data from APIs
   */

  const corraPrefix = "AVG.INTWO";
  const FXUSDCADPrefix = "FXUSDCAD";
  const urlCORRA = getAPIURL(corraPrefix, startDate, endDate);

  const urlFXUSDCAD = getAPIURL(FXUSDCADPrefix, startDate, endDate);
  let usdCADData = [],
    corraData = [],
    success = false,
    message = "";
  ({
    success,
    message,
    values: corraData,
  } = await fetchRates(urlCORRA, corraPrefix));
  if (success) {
    ({
      success,
      message,
      values: usdCADData,
    } = await fetchRates(urlFXUSDCAD, FXUSDCADPrefix));
  }
  const response = { success, message, corraData, usdCADData };
  return response;
};

// Calculates high, minimum and average values
const calculateStats = (data = []) => {
  let high = data[0] ?? 0;
  let minimum = data[0] ?? 0;
  let sum = 0;
  data.forEach((value) => {
    if (value > high) {
      high = value;
    }
    if (value < minimum) {
      minimum = value;
    }
    sum += value;
  });
  return {
    high: formatFloat(high),
    minimum: formatFloat(minimum),
    average: formatFloat(sum / data.length),
  };
};

// Function to calculate the pearson coefficient
const pearson = (x = [], y = []) => {
  const promedio = (l) => l.reduce((s, a) => s + a, 0) / l.length;
  const calc = (v, prom) =>
    Math.sqrt(v.reduce((s, a) => s + a * a, 0) - n * prom * prom);
  let n = x.length;
  let nn = 0;
  for (let i = 0; i < n; i++, nn++) {
    if ((!x[i] && x[i] !== 0) || (!y[i] && y[i] !== 0)) {
      nn--;
      continue;
    }
    x[nn] = x[i];
    y[nn] = y[i];
  }
  if (n !== nn) {
    x = x.splice(0, nn);
    y = y.splice(0, nn);
    n = nn;
  }
  const prom_x = promedio(x),
    prom_y = promedio(y);
  return (
    (x.map((e, i) => ({ x: e, y: y[i] })).reduce((v, a) => v + a.x * a.y, 0) -
      n * prom_x * prom_y) /
    (calc(x, prom_x) * calc(y, prom_y))
  );
};

// Present data stats in table
const displayStats = (data, sectionDiv) => {
  const { high, minimum, average } = data;

  $first("tbody", sectionDiv).innerHTML = `<tr><td>${high}</td>
  <td>${minimum}</td>
  <td>${average}</td>
    </tr>`;
};

// Search Form Handler
const searchHandler = async (e) => {
  e.preventDefault();

  // hide error messages and data tables
  resetSearchData({ clearFormFields: false });

  // Retrieve the form values
  const startDate = startDateTxt.value.trim();
  const endDate = endDateTxt.value.trim();

  // Validate Form data
  if (isEmptyString(startDate) || !isValidDate(startDate)) {
    updateContent(errorMessageLbl, "Start date is not valid");
    showElement(errorAlert);
    return;
  }

  if (isEmptyString(endDate) || !isValidDate(endDate)) {
    updateContent(errorMessageLbl, "End date is not valid");
    showElement(errorAlert);
    return;
  }

  if (compareDates(startDate, endDate) > 0) {
    updateContent(errorMessageLbl, "Start date is greater than end date");
    showElement(errorAlert);
    return;
  }

  // Process form with valid data inputs
  let success = false,
    message = "",
    corraData = [],
    usdCADData = [];

  // fetch API data
  ({ success, message, corraData, usdCADData } = await fetchData(
    startDate,
    endDate
  ));

  // Present data when Api call is successful
  if (success) {
    // Process and present data
    const corraStats = calculateStats(corraData);
    const usdCADStats = calculateStats(usdCADData);
    displayStats(corraStats, corraRateDiv);
    displayStats(usdCADStats, usdCADRateDiv);

    // Update pearson correlation coefficient
    const pearsonValue = formatFloat(pearson(corraData, usdCADData));
    const pearsonLbl = $first("#pearson-val");
    updateContent(pearsonLbl, pearsonValue);

    //  Display data tables
    showSections(searchDataSections);
    showElement(successAlert);
  } else {
    updateContent(errorMessageLbl, message);
    showElement(errorAlert);
  }
};

// Reset search Form Handler
const resetHandler = (e) => {
  resetSearchData({});
};

/** Event Registration */

searchBtn.addEventListener("click", searchHandler);
resetBtn.addEventListener("click", resetHandler);
hideSections(searchDataSections);
