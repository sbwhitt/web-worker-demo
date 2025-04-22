import { computed, Injectable, Signal, signal } from '@angular/core';
import QLearner from './QLearner';

export type Outcome = "win" | "lose" | "draw" | "active";

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {
  private numStates = Math.pow(3, 9);
  private numActions = 9;
  private qLearner!: QLearner;
  private LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];

  public currentBoard = signal("000000000");
  public currentOutcome: Signal<Outcome> = computed(() => {
    return this.getOutcome(
      this.toState(this.currentBoard())
    );
  });

  constructor() {
    this.qLearner = new QLearner(this.numStates, this.numActions);
  }

  public async trainLearner(games: number): Promise<void> {
    console.log(`starting training with ${games} games`);
    const limit = 1000;
    const start = Date.now();
    for (let game = 0; game < games; game++) {
      let count = 0;
      let gameReward = 0;
      let board = "000000000";
      let state = this.toState(board);
      let action = await this.qLearner.setState(state);
      let outcome = "active";
      while (outcome === "active" && count < limit) {
        board = this.updateBoard(state, action, true);
        state = this.toState(board);
        outcome = this.getOutcome(state);
        const reward = this.getReward(outcome);

        action = await this.qLearner.query(state, reward);

        gameReward += reward;
        count += 1;
      }
    }
    console.log(`training complete after ${(Date.now() - start)/1000} seconds`);
  }

  public resetLearner(): void {
    this.qLearner = new QLearner(this.numStates, this.numActions);
    this.currentBoard.set("000000000");
  }

  public async startGame(): Promise<void> {
    this.currentBoard.set("000000000");
    await this.takeLearnerTurn("active");
  }

  public async takePlayerTurn(action: number): Promise<void> {
    this.currentBoard.set(
      this.updateBoard(this.toState(this.currentBoard()), action, false, 2)
    );
    if (this.currentOutcome() !== "active") { return; }
    await this.takeLearnerTurn(this.getOutcome(this.toState(this.currentBoard())));
  }

  private async takeLearnerTurn(outcome: string): Promise<void> {
    let newBoard = this.currentBoard();
    while (newBoard == this.currentBoard()) {
      let state = this.toState(this.currentBoard());
      const learnerAction = await this.qLearner.query(state, this.getReward(outcome));
      newBoard = this.updateBoard(state, learnerAction, false, 1);
    }
    this.currentBoard.set(newBoard);
  }

  private toBoard(state: number): string {
    return state.toString(3).padStart(9, "0");
  }

  private toState(board: string): number {
    return Number.parseInt(board, 3);
  }

  private getOutcome(state: number): Outcome {
    const board = this.toBoard(state);
    for (let line of this.LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if (l === "111") { return "win"; }
      if (l === "222") { return "lose"; }
    }
    for (let line of this.LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if ( !(l.includes("1") && l.includes("2")) ) { return "active"; }
    }
    return "draw";
  }

  private getReward(outcome: string): number {
    switch (outcome) {
      case "win": return 1
      case "lose": return -5
      case "draw":
      case "active":
      default: return -1;
    }
  }

  private place(board: string, tile: number, player: 1 | 2): string {
    const b = [...board];
    b[tile] = player.toString();
    return b.join("");
  }

  private placeOpponent(board: string): string {
    const free: number[] = [];
    [...board].map((t, i) => {
      if (t === "0") { free.push(i); }
    });
    if (free.length === 0) { return board; }

    let action: number | null = null;
    for (let line of this.LINES) {
      if (Math.random() < 0.5) { break; } // test moving this out of loop
  
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
    return this.place(board, action, 2);
  }

  private updateBoard(
    state: number,
    action: number,
    training: boolean = false,
    player: 1 | 2 = 1
  ): string {
    let board = this.toBoard(state);
    if (board[action] !== "0") { return board; }
    board = this.place(board, action, player);
    return training ? this.placeOpponent(board) : board;
  }
}
