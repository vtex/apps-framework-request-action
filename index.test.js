const requestProcessor = require("./request-processor");
const process = require("process");
const cp = require("child_process");
const path = require("path");

const appSpecification = {
  name: "starter-node-service",
  vendor: "vtex",
  version: "0.0.10",
  services: [
    {
      name: "service",
      folder: "./",
      "image-name": "vtex-docker/starter-node-service",
      public: true,
    },
  ],
};

test("send a request to create a version and return status 201", async () => {
  const statusCode = await requestProcessor(
    "create-app-version",
    JSON.stringify(appSpecification),
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
