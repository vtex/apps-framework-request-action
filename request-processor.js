const core = require('@actions/core');
const yaml = require('js-yaml')
const axios = require('axios')

const serviceBaseUrl = 'https://apps-framework-api-beta.vtex.io'

const requestProcessor = async function(requestName, appSpecification) {
  switch (requestName) {
    case 'create-app-release':
      return await executeCreateAppRelease(appSpecification)
    default:
      throw new Error(`Unknown request name: ${requestName}`)
  }
};

async function executeCreateAppRelease(appSpecification) {
  if (!appSpecification) {
    throw new Error('app-specification is required')
  }
  const parsedAppSpecification = parseAppSpecification(appSpecification)
  const appId = `${parsedAppSpecification.vendor}.${parsedAppSpecification.name}`
  const payload = buildPayloadForCreateAppRelease(parsedAppSpecification)
  const apiUrl = `${serviceBaseUrl}/apps/${appId}/releases`
  core.info(`Calling ${apiUrl}`)
  core.debug(`Payload: ${JSON.stringify(payload, null, 2)}`)
  const response = await axios.post(apiUrl, payload)
  if (response.status === 201) {
    core.info('Successfully created app release')
    return response.status.toString();
  } else {
    throw new Error(`Error creating app release: ${response.status}. Response body: ${response.data}`)
  }
}

function buildPayloadForCreateAppRelease(appSpecification) {
  return {
    context: 'staging',
    appSpecification,
  }
}

function parseAppSpecification(appSpecification) {
  return yaml.load(appSpecification)
}

module.exports = requestProcessor;
