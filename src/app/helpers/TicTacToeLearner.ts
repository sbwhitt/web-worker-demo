import { QLearner } from "./QLearner";

export type Outcome = "win" | "lose" | "draw" | "active";
export interface GameState {
  board: string;
  outcome: Outcome;
}

export class TicTacToeLearner {
  private numStates = Math.pow(3, 9);
  private numActions = 9;
  private LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];
  private qLearner!: QLearner;

  constructor(
    Q?: number[][]
  ) {
    this.qLearner = Q ?
      new QLearner({ Q }) :
      new QLearner({
        numStates: this.numStates,
        numActions: this.numActions
      });
  }

  public train(games: number): void {
    const limit = 1000;
    for (let game = 0; game < games; game++) {
      const piece = game % 2 === 0 ? 1 : 2;
      let count = 0;
      let gameReward = 0;
      let board = piece === 1 ?
        "000000000" :
        this.placeOpponent("000000000", 1);
      let state = this.toState(board);
      let action = this.qLearner.setState(state);
      let outcome = "active";
      while (outcome === "active" && count < limit) {
        board = this.updateBoard(state, action, piece, true);
        state = this.toState(board);
        outcome = this.getOutcome(state, piece);
        const reward = this.getReward(outcome);
        action = this.qLearner.query(state, reward, true);
        gameReward += reward;
        count += 1;
      }
      if (game % Math.floor(games / 100) === 0 || game === games-1) { postMessage(game+1); }
    }
  }

  public getQTable(): number[][] {
    return this.qLearner.Q;
  }

  public startGame(playerPiece: 1 | 2): GameState {
    this.train(1); // make sure learner is fully initialized
    let board = "000000000";
    if (playerPiece === 2) {
      const action = this.qLearner.setState(this.toState(board));
      board = this.updateBoard(this.toState(board), action, 1);
    }
    return {
      board,
      outcome: this.getOutcome(this.toState(board), playerPiece)
    }
  }

  public takePlayerTurn(action: number, board: string, piece: 1 | 2): GameState {
    let currentBoard = this.updateBoard(this.toState(board), action, piece);
    currentBoard = this.takeLearnerTurn(currentBoard, piece === 1 ? 2 : 1);
    return {
      board: currentBoard,
      outcome: this.getOutcome(this.toState(currentBoard), piece)
    }
  }

  private takeLearnerTurn(currentBoard: string, piece: 1 | 2): string {
    let newBoard = currentBoard;
    const limit = 1000;
    let count = 0;
    while (newBoard === currentBoard && count < limit) {
      let state = this.toState(newBoard);
      let reward = this.getReward(this.getOutcome(state, piece));
      const learnerAction = this.qLearner.query(state, reward, false);
      newBoard = this.updateBoard(state, learnerAction, piece);
      let outcome = this.getOutcome(this.toState(newBoard), piece);
      if (outcome !== "active") { return newBoard; }
      count++;
    }
    return newBoard;
  }

  private toBoard(state: number): string {
    return state.toString(3).padStart(9, "0");
  }

  private toState(board: string): number {
    return Number.parseInt(board, 3);
  }

  private getOutcome(state: number, piece: 1 | 2): Outcome {
    const board = this.toBoard(state);
    for (let line of this.LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if (l === "111") {
        return piece === 1 ? "win" : "lose";
      }
      if (l === "222") {
        return piece === 2 ? "win" : "lose";
      }
    }
    for (let line of this.LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if ( !(l.includes("1") && l.includes("2")) ) { return "active"; }
    }
    return "draw";
  }

  private getReward(outcome: string): number {
    switch (outcome) {
      case "win": return 3
      case "lose": return -5
      case "draw": return -1;
      case "active": return -2;
      default: return -1;
    }
  }

  private place(board: string, tile: number, piece: 1 | 2): string {
    const b = [...board];
    b[tile] = piece.toString();
    return b.join("");
  }

  private placeOpponent(board: string, oppPiece: 1 | 2): string {
    const free: number[] = [];
    [...board].map((t, i) => {
      if (t === "0") { free.push(i); }
    });
    if (free.length === 0) { return board; }

    let action: number | null = null;
    const rand = Math.random();
    for (let line of this.LINES) {
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
    return this.place(board, action, oppPiece);
  }

  private updateBoard(
    state: number,
    action: number,
    piece: 1 | 2,
    training: boolean = false
  ): string {
    let board = this.toBoard(state);
    if (board[action] !== "0") { return board; }
    board = this.place(board, action, piece);
    return training ?
      this.placeOpponent(board, piece === 1 ? 2 : 1) :
      board;
  }
}
