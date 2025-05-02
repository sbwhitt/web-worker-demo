/// <reference lib="webworker" />

import { fibonacci } from "../services/fibonacci.service";

addEventListener('message', ({ data }) => {
  postMessage(fibonacci(data));
});
