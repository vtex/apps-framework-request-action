require('dotenv').config()
const requestProcessor = require("./request-processor");
const process = require("process");
const cp = require("child_process");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const appSpecification = {
  name: "starter-node-service",
  vendor: "vtex",
  version: `1.0.0-${uuidv4()}`,
  services: [
    {
      name: "service",
      folder: "./",
      "image-name": "vtex-docker/starter-node-service",
      public: true,
    },
  ],
};

jest.setTimeout(10000)

test("send a request to create a version and return status 201", async () => {
  const statusCode = await requestProcessor(
    process.env.VTEX_APP_KEY,
    process.env.VTEX_APP_TOKEN,
    "create-app-version",
    JSON.stringify(appSpecification),
    'development',
    false
  );
  expect(statusCode).toBe("201");
});

// shows how the runner will run a javascript action with env / stdout protocol
test.skip("test runs", () => {
  process.env["INPUT_REQUEST-TYPE"] = "create-app-version";
  process.env["INPUT_APP-SPECIFICATION"] = JSON.stringify(appSpecification);
  process.env["INPUT_WAIT-APP-VERSION-COMPLETE"] = "true";
  const ip = path.join(__dirname, "index.js");
  const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
  console.log(result);
});
