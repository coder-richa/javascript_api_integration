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

const formatFloat = (value) => parseFloat(value).toFixed(4);

const resetSearchData = ({ clearFormFields = true }) => {
  hideElement(errorAlert);
  hideElement(successAlert);
  hideSections(searchDataSections);
  if (clearFormFields) {
    startDateTxt.value = "";
    endDateTxt.value = "";
  }
};

const resetHandler = (e) => {
  resetSearchData({});
};

const fetchRates = async (url, parameterName = "AVG.INTWO") => {
  const method = `get`;
  const response = await getResponseJSON({
    url,
    body: new FormData(),
    method,
    mode: "cors",
  });
  const success = (response?.observations ?? []).length > 0;
  const message = success
    ? "Data Fetched successfully"
    : "Something went wrong";
  const values = [];
  const observations = response?.observations ?? [];
  observations.forEach((observation) => {
    values.push(Number(observation[parameterName]?.v ?? 0));
  });
  return values;
};

const fetchData = async (startDate, endDate) => {
  const urlCORRA = `https://www.bankofcanada.ca/valet/observations/AVG.INTWO/json?start_date=${startDate}&end_date=${endDate}`;

  const urlFXUSDCAD = `https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?start_date=${startDate}&end_date=${endDate}`;

  const corraData = await fetchRates(urlCORRA, "AVG.INTWO");
  const usdCADData = await fetchRates(urlFXUSDCAD, "FXUSDCAD");
  const response = [corraData, usdCADData];
  return response;
};

const processData = (data = []) => {
  let high = data[0] ?? 0;
  let minimum = data[0] ?? 0;
  let sum = data[0] ?? 0;
  data.forEach((value) => {
    if (value > high) {
      high = value;
    }
    if (value < minimum) {
      minimum = value;
    }
    sum += value;
  });
  return [
    formatFloat(high),
    formatFloat(minimum),
    formatFloat(sum / data.length),
  ];
};

const pearson = (x, y) => {
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

const showData = (data, sectionDiv) => {
  const [high, minimum, average] = data;

  $first("tbody", sectionDiv).innerHTML = `<tr><td>${high}</td>
  <td>${minimum}</td>
  <td>${average}</td>
    </tr>`;
};

const searchHandler = async (e) => {
  e.preventDefault();

  // hide error messages and data tables
  resetSearchData({ clearFormFields: false });
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

  // fetch API data
  const [corraData, usdCADData] = await fetchData(startDate, endDate);

  // Process and present data
  const corraStats = processData(corraData);
  const usdCADStats = processData(usdCADData);
  showData(corraStats, corraRateDiv);
  showData(usdCADStats, usdCADRateDiv);

  // Update pearson correlation coefficient
  const pearsonValue = formatFloat(pearson(corraData, usdCADData));
  const pearsonLbl = $first("#pearson-val");
  updateContent(pearsonLbl, pearsonValue);

  //  Display data tables
  showSections(searchDataSections);
  showElement(successAlert);
};

/** Event Registration */

searchBtn.addEventListener("click", searchHandler);
resetBtn.addEventListener("click", resetHandler);
hideSections(searchDataSections);
