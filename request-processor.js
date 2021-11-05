const core = require("@actions/core");
const yaml = require("js-yaml");
const axios = require("axios");

const serviceBaseUrl = "https://apps-framework-api-beta.vtex.io";

const requestProcessor = async function (
  requestName,
  appSpecification,
  waitAppReleaseComplete
) {
  switch (requestName) {
    case "create-app-release":
      return await executeCreateAppRelease(
        appSpecification,
        waitAppReleaseComplete
      );
    default:
      throw new Error(`Unknown request name: ${requestName}`);
  }
};

async function executeCreateAppRelease(
  appSpecification,
  waitAppReleaseComplete
) {
  if (!appSpecification) {
    throw new Error("app-specification is required");
  }
  const parsedAppSpecification = parseAppSpecification(appSpecification);
  const appId = `${parsedAppSpecification.vendor}.${parsedAppSpecification.name}`;
  const payload = buildPayloadForCreateAppRelease(parsedAppSpecification);
  const apiUrl = `${serviceBaseUrl}/apps/${appId}/releases`;
  core.info(`Calling ${apiUrl}`);
  core.debug(`Payload: ${JSON.stringify(payload, null, 2)}`);
  const response = await axios.post(apiUrl, payload);
  if (response.status === 201) {
    const appReleaseId = response.data.id;
    core.info(
      `Successfully submitted app release. App release id: ${appReleaseId}`
    );
    if (waitAppReleaseComplete) {
      core.info("Waiting for app release completion")
      await waitAppReleaseFinalStatus(appId, appReleaseId)
    }
    return response.status.toString();
  } else {
    throw new Error(
      `Error creating app release: ${response.status}. Response body: ${response.data}`
    );
  }
}

function buildPayloadForCreateAppRelease(appSpecification) {
  return {
    context: "staging",
    appSpecification,
  };
}

function parseAppSpecification(appSpecification) {
  return yaml.load(appSpecification);
}

const waitInterval = 10 * 1000;
const timeout = 5 * 60 * 1000;

async function waitAppReleaseFinalStatus(appId, appReleaseId) {
  const maxCounter = Math.floor(timeout / waitInterval)
  let counter = 0
  while (counter < maxCounter) {
    counter++
    const appReleaseStatus = await fetchAppReleaseStatus(appId, appReleaseId);
    if (isAppReleaseFinalStatus(appReleaseStatus)) {
      core.info(`App release is complete. Status: ${appReleaseStatus}`)
      if (appReleaseStatus === "failed") {
        throw new Error(`App release failed`)
      }
      return
    } else {
      core.info(`App release is not complete. Status: ${appReleaseStatus}`)
      await wait(waitInterval)
    }
  }

  throw new Error('Timeout waiting for app release completion')
}

function isAppReleaseFinalStatus(appReleaseStatus) {
  return appReleaseStatus === "successful" || appReleaseStatus === "failed";
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("done"), milliseconds)
  })
}

async function fetchAppReleaseStatus(appId, appReleaseId) {
  const apiUrl = `${serviceBaseUrl}/apps/${appId}/releases/${appReleaseId}`;
  try {
    const response = await axios.get(apiUrl);
    if (response.status === 200) {
      const appRelease = response.data;
      return appRelease.status;
    } else {
      core.warning(
        `Error fetching app release status: ${response.status}. Response body: ${response.data}`
      );
      return "unknown";
    }
  } catch (error) {
    core.warning(`Error fetching app release status: ${error}`);
    return "unknown";
  }
}

module.exports = requestProcessor;
