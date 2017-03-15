# Sensic

The Sensic board game logic simulator.

## Development

The project uses [Webpack](http://webpack.github.io/) and the Webpack development server to build and serve the application. Webpack is configured with Babel loaders for ES6/ES7 syntax support. Additionally, React has been added as a dependency in case we want to use that in developing the interface. To start developing the game logic and the simulated UI you first need to install the required dependencies:

```
yarn
```

You can then build the app and run the Webpack development server:

```
yarn start
```

The app is now available in your browser at [http://localhost:8888](http://localhost:8888). The Webpack development server is also configured with code hotloading on changes so you won't need to reload the browser page manually when doing changes.

Note that you can naturally also develop the game logic separately from the browser interface by using test-driven development with the instructions below.

## Testing

The project uses [Karma](https://karma-runner.github.io/) test runner for running tests written with the [Jasmine](https://jasmine.github.io/) test framework. The test runner automatically watches test files with the naming format `*.spec.js`. To continuously run tests on file changes, use:

```
yarn test:watch
```

You can also run all the tests as a single-run with:

```
yarn test
```
