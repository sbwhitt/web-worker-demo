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
    alpha: number = 0.2,
    gamma: number = 0.9,
    rar: number = 0.5,
    radr: number = 0.99
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

export function trainLearner(games: number) {
  type Outcome = "win" | "lose" | "draw" | "active";

  const numStates = Math.pow(3, 9);
  const numActions = 9;
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];

  let qLearner = new QLearner({ numStates, numActions });

  const trainLearner = (games: number): void => {
    const limit = 1000;
    for (let game = 0; game < games; game++) {
      let count = 0;
      let gameReward = 0;
      let board = "000000000";
      let state = toState(board);
      let action = qLearner.setState(state);
      let outcome = "active";
      while (outcome === "active" && count < limit) {
        board = updateBoard(state, action, true);
        state = toState(board);
        outcome = getOutcome(state);
        const reward = getReward(outcome);
        action = qLearner.query(state, reward, true);
        gameReward += reward;
        count += 1;
      }
      postMessage(game+1);
    }
  }

  const toBoard = (state: number): string => {
    return state.toString(3).padStart(9, "0");
  }

  const toState = (board: string): number => {
    return Number.parseInt(board, 3);
  }

  const getOutcome = (state: number): Outcome => {
    const board = toBoard(state);
    for (let line of LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if (l === "111") { return "win"; }
      if (l === "222") { return "lose"; }
    }
    for (let line of LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if ( !(l.includes("1") && l.includes("2")) ) { return "active"; }
    }
    return "draw";
  }

  const getReward = (outcome: string): number => {
    switch (outcome) {
      case "win": return 1
      case "lose": return -5
      case "draw":
      case "active":
      default: return -1;
    }
  }

  const place = (board: string, tile: number, player: 1 | 2): string => {
    const b = [...board];
    b[tile] = player.toString();
    return b.join("");
  }

  const placeOpponent = (board: string): string => {
    const free: number[] = [];
    [...board].map((t, i) => {
      if (t === "0") { free.push(i); }
    });
    if (free.length === 0) { return board; }

    let action: number | null = null;
    const rand = Math.random();
    for (let line of LINES) {
      if (rand < 0.5) { break; }
  
      const a = line[0]; const b = line[1]; const c = line[2];
      if ((board[a] === board[b]) && (board[c] === "0")) {
        action = c;
        break;
      }
      else if ((board[a] === board[c]) && (board[b] === "0")) {
        action = b;
        break;
      }
      else if ((board[b] === board[c]) && (board[a] === "0")) {
        action = a;
        break;
      }
    }
    action = action ? action : free[Math.floor(Math.random() * free.length)];
    return place(board, action, 2);
  }

  const updateBoard = (
    state: number,
    action: number,
    training: boolean = false,
    player: 1 | 2 = 1
  ): string => {
    let board = toBoard(state);
    if (board[action] !== "0") { return board; }
    board = place(board, action, player);
    return training ? placeOpponent(board) : board;
  }

  trainLearner(games);
  return qLearner.Q;
}
