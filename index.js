const core = require("@actions/core");
const requestProcessor = require("./request-processor");

async function run() {
  try {
    const requestName = core.getInput("request-type");
    const appSpecification = core.getInput("app-specification");
    const appVersionType = core.getInput("app-version-type");
    const waitAppVersionComplete = core.getBooleanInput(
      "wait-app-version-complete"
    );

    core.debug(new Date().toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    const statusCode = await requestProcessor(
      requestName,
      appSpecification,
      appVersionType,
      waitAppVersionComplete
    );
    core.info(new Date().toTimeString());

    core.setOutput("statusCode", statusCode);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
