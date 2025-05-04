# Angular WebWorker Demo

A couple of interactive widgets that simulate long-running operations in the browser to demonstrate the usefullness of WebWorkers in Angular. 

Hosted using Github Pages at: <a href="https://sbwhitt.github.io/web-worker-demo/" target="_blank">https://sbwhitt.github.io/web-worker-demo/</a>

## WebWorker Overview
* Multi-threading in the browser
* Best for long-running CPU intensive operations on the client side
  * Operations that cannot easily be off-loaded onto the server
  * Prevents UI from locking up while waiting on long synchronous operations
  * HTTP requests better off handled using async/await, but workers do have access to `fetch`

### Use
* Provide `Worker` object with JS script
* All code/dependencies must be contained within a single file
* Worker does not have access to the original execution context
  * No access to DOM/window
* Communicate between workers and main thread through the use of messages
  * Define `onmessage` handler after declaring worker that handles worker output
  * Worker uses `postMessage` to transmit data
    * Data transmitted by `postMessage` must be JSON object only, no function objects
    * Data is deep copied from worker to destination
* Stop workers by calling `terminate`
* Errors within workers are handled by `onerror` message handler

### Angular support
* Create new WebWorker file using the Angular CLI: `ng generate web-worker <name>`
  * Output is `<name>.worker.ts`
  * Also creates `tsconfig.worker.json` with settings for compiling worker ts file
* Initialize worker with `new Worker(new URL('<name>.worker', import.meta.url))`
  * Must use `import.meta.url` when importing worker file due to path changes during bundling
* Angular packages all dependencies used by worker and creates contained script for worker

#### Default Angular worker file

```
/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const response = `worker response to ${data}`;
  postMessage(response);
});
```

### Browser support
* Widely supported by major browsers
* Check for support and provide backup code using `if (!window.Worker) { /* worker-less code */ }`

### Sources

1. https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
2. https://developer.mozilla.org/en-US/docs/Web/API/Worker
3. https://developer.mozilla.org/en-US/docs/Web/API/Worker#browser_compatibility
4. https://angular.dev/ecosystem/web-workers

### Useful Guides

1. https://blog.logrocket.com/real-time-processing-web-workers/
2. https://medium.com/codex/web-workers-in-angular-99fc4dac1d40


## Widgets

### TicTacToe Learner
* Reinforcement Learning applied to TicTacToe
* Implemented using QLearning
* Train Learner on a specific number of games
  * Learner converges after playing ~60,000 games with the current setup

### Fibonacci Number Finder
* Exponential time algorithm to find Nth Fibonacci number
* Very slow
