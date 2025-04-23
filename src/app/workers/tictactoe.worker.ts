/// <reference lib="webworker" />

import { trainLearner } from "../helpers/TicTacToeLearner";

addEventListener('message', ({ data }) => {
  const Q = trainLearner(data);
  postMessage(Q);
});
