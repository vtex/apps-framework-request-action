const core = require("@actions/core");
const requestProcessor = require("./request-processor");

async function run() {
  try {
    const requestName = core.getInput("request-type");
    const appSpecification = core.getInput("app-specification");
    const appVersionVisibility = core.getInput("version-visibility");
    const waitAppVersionComplete = core.getBooleanInput(
      "wait-app-version-complete"
    );

    core.debug(new Date().toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    const statusCode = await requestProcessor(
      requestName,
      appSpecification,
      appVersionVisibility,
      waitAppVersionComplete
    );
    core.info(new Date().toTimeString());

    core.setOutput("statusCode", statusCode);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
