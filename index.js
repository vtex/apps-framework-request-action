const core = require('@actions/core');
const requestProcessor = require('./request-processor');

async function run() {
  try {
    const requestName = core.getInput('request-type');
    const appSpecification = core.getInput('app-specification');
    const waitAppReleaseComplete = new Boolean(core.getInput('wait-app-release-complete'));

    core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    await requestProcessor(requestName, appSpecification, waitAppReleaseComplete);
    core.info((new Date()).toTimeString());

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
