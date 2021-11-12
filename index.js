const core = require("@actions/core");
const requestProcessor = require("./request-processor");

async function run() {
  try {
    const requestName = core.getInput("request-type");
    const appSpecification = core.getInput("app-specification");
    const appReleaseType = core.getInput("app-release-type");
    const waitAppReleaseComplete = core.getBooleanInput(
      "wait-app-release-complete"
    );

    core.debug(new Date().toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    const statusCode = await requestProcessor(
      requestName,
      appSpecification,
      appReleaseType,
      waitAppReleaseComplete
    );
    core.info(new Date().toTimeString());

    core.setOutput("statusCode", statusCode);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
