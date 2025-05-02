export interface QLearnerOptions {
  numStates?: number;
  numActions?: number;
  Q?: number[][];
}

export class QLearner {
  private alpha!: number;
  private gamma!: number;
  private rar!: number;
  private radr!: number;
  private s!: number;
  private a!: number;
  public Q!: number[][];

  constructor(
    options: QLearnerOptions,
    alpha: number = 1,
    gamma: number = 0.9,
    rar: number = 0.5,
    radr: number = 0.9
  ) {
    // initialize with numStates and numActions for fresh QLearner
    if (options.numStates === undefined && options.numActions === undefined && options.Q !== undefined) {
      this.Q = options.Q;
    }
    // or inititalize with pre-built Q table for immediate use
    else if (options.numStates !== undefined && options.numActions !== undefined) {
      this.Q = this.buildQ(options.numStates, options.numActions);
    }
    else {
      throw Error("QLearner initialized with invalid options.");
    }
    this.alpha = alpha;
    this.gamma = gamma;
    this.rar = rar;
    this.radr = radr;
  }

  public setState = (s: number): number => {
    this.s = s;
    this.a = this.selectAction(s, false);
    return this.a;
  }

  public query = (sPrime: number, r: number, random: boolean): number => {
    this.updateQ(this.s, this.a, sPrime, r);

    this.s = sPrime;
    this.a = this.selectAction(sPrime, random);

    this.rar = this.rar * this.radr;

    return this.a;
  }

  private buildQ = (numStates: number, numActions: number): number[][] => {
    const arr = [];
    while (arr.length < numStates) {
      arr.push(new Array(numActions).fill(0));
    }
    return arr;
  }

  private selectAction = (s: number, random: boolean): number => {
    const actions = this.Q[s];
    const r = Math.random();
    if (random && r <= this.rar) {
      return Math.floor(Math.random()*actions.length);
    }

    let a = 0;
    let max = actions[a];
    for (let i = 1; i < actions.length; i++) {
      if (actions[i] > max) {
        a = i;
        max = actions[i];
      }
    }
    return a;
  }

  private updateQ = (s: number, a: number, sPrime: number, r: number): void => {
    const currentQ = this.Q[s][a];
    const nextQ = this.Q[sPrime][this.selectAction(sPrime, false)];

    this.Q[s][a] = currentQ + this.alpha*(r + this.gamma*nextQ - currentQ);
  }
}
