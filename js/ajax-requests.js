// createRequest retuns promise of requested url
const createRequest = ({
  url,
  body = new FormData(),
  method = "get",
  mode = "cors",
}) =>
  // GET and HEAD method does not have request body
  fetch(
    url,
    ["get", "head"].includes(method.toLowerCase())
      ? { method, mode }
      : { body, method, mode }
  );

// processRequestStatus rejects error in case something went wrong
// otherwise, returns response as a promise
const processRequestStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
};

//processRequestJSON returns json from response
const processRequestJSON = async (response) => {
  const js = response.json();
  return js;
};

// getResponseJSON returns response json
const getResponseJSON = async ({
  url,
  body = new FormData(),
  method = "get",
  mode = "cors",
}) => {
  let responseJson;
  try {
    let response = await createRequest({ url, body, method, mode });
    response = await processRequestStatus(response);
    responseJson = await processRequestJSON(response);
  } catch (err) {
    renderError(err);
    responseJson = {
      success: 0,
      message: "Something went wrong",
    };
  }
  return responseJson;
};
const renderError = (err) => {
  console.warn(err.message);
};
