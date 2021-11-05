# VTEX Apps Framework API request action

Execute an API request for VTEX Apps Framework

## Usage

You can consume the action by referencing one of the existing branches. Example:

```yaml
uses: vtex/apps-framework-request-action@v1
with:
  request-type: create-app-release
  app-specification: '{"name":"app-name","vendor":"vendor-name","version":"0.0.10","services":[{"name":"service","folder":"./","image-name":"vtex-docker/image-name"}]}'
  wait-app-release-complete: true # Optional
```

See the [actions tab](https://github.com/actions/apps-framework-request-action/actions) for runs of this action! :rocket:

`request-type` is mandatory and can be one of the following values

- `create-app-release`

The other parameters are required or optional depending on the request type

### create-app-release params

`app-specification`: **mandatory**. It is the parsed content of `vtex.yml` file of your app. The app-specification can be retrieved `get-vtex-app-metadata-action`:

```yaml
- name: Get app metadata
  id: app-metadata
  uses: ./.github/actions/get-vtex-app-metadata
```

Then you can reference it with `${{steps.app-metadata.outputs.app-specification}}`

`wait-app-release-complete`: **optional**. Default value: `false`. If `true`, the app `create-app-release` action will finish only when the deploy succeeds or fails.

## Contribute

### Development

Install the dependencies

```bash
yarn install
```

Run the tests :heavy_check_mark:

```bash
yarn run test
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages. This action is based in the [JavaScript Action template](https://github.com/actions/javascript-action).

### Package for distribution

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

### Create a release branch

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
