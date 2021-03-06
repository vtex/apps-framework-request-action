const core = require("@actions/core");
const yaml = require("js-yaml");
const axios = require("axios");

const serviceBaseUrl = "https://apps-framework-api-beta.vtex.io";

const requestProcessor = async function (
  appKey,
  appToken,
  requestName,
  appSpecification,
  appVersionVisibility,
  waitAppVersionComplete
) {
  switch (requestName) {
    case "create-app-version":
      return await executeCreateAppVersion(
        appKey,
        appToken,
        appSpecification,
        appVersionVisibility,
        waitAppVersionComplete
      );
    default:
      throw new Error(`Unknown request name: ${requestName}`);
  }
};

async function executeCreateAppVersion(
  appKey,
  appToken,
  appSpecification,
  appVersionVisibility,
  waitAppVersionComplete
) {
  if (!appSpecification) {
    throw new Error("app-specification is required");
  }
  const parsedAppSpecification = parseAppSpecification(appSpecification);
  const appId = `${parsedAppSpecification.vendor}.${parsedAppSpecification.name}`;
  const payload = buildPayloadForCreateAppVersion(
    parsedAppSpecification,
    appVersionVisibility
  );
  const apiUrl = `${serviceBaseUrl}/apps/${appId}/versions`;
  core.info(`Calling ${apiUrl}`);
  core.debug(`Payload: ${JSON.stringify(payload, null, 2)}`);

  let response;
  try {
    response = await axios.post(apiUrl, payload, {
      headers: createVtexAuthHeaders(appKey, appToken),
    });
  } catch (error) {
    if (error.isAxiosError) {
      throw new Error(buildErrorMessage(error.response, error));
    }
    throw error;
  }

  if (response.status === 201) {
    const appVersionId = response.data.id;
    core.info(
      `Successfully submitted app version. App version id: ${appVersionId}`
    );
    if (waitAppVersionComplete) {
      core.info("Waiting for app version completion");
      await waitAppVersionFinalStatus(appKey, appToken, appId, appVersionId);
    }
    return response.status.toString();
  } else {
    throw new Error(buildErrorMessage(response));
  }
}

function buildErrorMessage(serverResponse, err) {
  if (serverResponse) {
    const { status, data } = serverResponse;
    const body = formatErrorMessageBody(data);
    return `Error creating app version: HTTP status ${status}. Response body: ${body}`;
  } else {
    return `Error creating app version: ${err}`;
  }
}

function formatErrorMessageBody(responseData) {
  try {
    return JSON.stringify(responseData, null, 2);
  } catch (error) {
    return responseData;
  }
}

function buildPayloadForCreateAppVersion(
  appSpecification,
  appVersionVisibility
) {
  return {
    appSpecification,
    appVersionVisibility,
  };
}

function parseAppSpecification(appSpecification) {
  return yaml.load(appSpecification);
}

const waitInterval = 10 * 1000;
const timeout = 5 * 60 * 1000;

async function waitAppVersionFinalStatus(appKey, appToken, appId, appVersionId) {
  const maxCounter = Math.floor(timeout / waitInterval);
  let counter = 0;
  while (counter < maxCounter) {
    counter++;
    const appVersionStatus = await fetchAppVersionStatus(appKey, appToken, appId, appVersionId);
    if (isAppVersionFinalStatus(appVersionStatus)) {
      core.info(`App version is complete. Status: ${appVersionStatus}`);
      if (appVersionStatus === "failed") {
        throw new Error(`App version failed`);
      }
      return;
    } else {
      core.info(`App version is not complete. Status: ${appVersionStatus}`);
      await wait(waitInterval);
    }
  }

  throw new Error("Timeout waiting for app version completion");
}

function isAppVersionFinalStatus(appVersionStatus) {
  return appVersionStatus === "successful" || appVersionStatus === "failed";
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("done"), milliseconds);
  });
}

async function fetchAppVersionStatus(appKey, appToken, appId, appVersionId) {
  const apiUrl = `${serviceBaseUrl}/apps/${appId}/versions/${appVersionId}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: createVtexAuthHeaders(appKey, appToken),
    });
    if (response.status === 200) {
      const appVersion = response.data;
      return appVersion.status;
    } else {
      core.warning(
        `Error fetching app version  status: ${response.status}. Response body: ${response.data}`
      );
      return "unknown";
    }
  } catch (error) {
    core.warning(`Error fetching app version status: ${error}`);
    return "unknown";
  }
}

function createVtexAuthHeaders(appKey, appToken) {
  return {
    "X-VTEX-API-AppKey": appKey,
    "X-VTEX-API-AppToken": appToken,
  };
}

module.exports = requestProcessor;
