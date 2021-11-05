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

test("send a request to create a release and return status 201", async () => {
  const statusCode = await requestProcessor(
    "create-app-release",
    JSON.stringify(appSpecification)
  );
  expect(statusCode).toBe('201');
});

// shows how the runner will run a javascript action with env / stdout protocol
test.skip("test runs", () => {
  process.env["INPUT_REQUEST-TYPE"] = "create-app-release";
  process.env["INPUT_APP-SPECIFICATION"] = JSON.stringify(appSpecification);
  const ip = path.join(__dirname, "index.js");
  const result = cp.execSync(`node ${ip}`, { env: process.env }).toString();
  console.log(result);
});
