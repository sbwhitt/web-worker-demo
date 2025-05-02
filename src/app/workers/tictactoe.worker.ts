/// <reference lib="webworker" />

import { TicTacToeLearner } from "../helpers/TicTacToeLearner";

addEventListener('message', ({ data }) => {
  if (typeof data !== "number") {
    throw Error("Invalid data passed to worker.");
  }
  const learner = new TicTacToeLearner()
  learner.train(data);
  postMessage(learner.getQTable());
});
