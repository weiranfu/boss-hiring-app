import axios from "axios";

const baseURL = "http://localhost:4000";

/**
 *
 * @param {String} url
 * @param {Object} date             body object for http request
 * @param {Object} customConfig     costom config like params
 */
export async function client(url, { body, ...customConfig } = {}) {
  const headers = { "Content-Type": "application/json" };

  const config = {
    url: baseURL + url,
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  if (body) {
    config.data = body;
  }
  return axios(config);
}

client.get = function (url, customConfig = {}) {
  return client(url, customConfig);
};

client.post = function (url, body, customConfig = {}) {
  return client(url, { body, ...customConfig });
};
