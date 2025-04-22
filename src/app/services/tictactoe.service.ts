import { Injectable } from '@angular/core';
import QLearner from './QLearner';

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {
  private qLearner!: QLearner;
  private LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];

  constructor() {
    const numStates = Math.pow(3, 9);
    const numActions = 9;
    this.qLearner = new QLearner(numStates, numActions);
  }

  public train = async (games: number): Promise<void> => {
    console.log(`starting training with ${games} games`);
    const limit = 1000;
    const start = Date.now();
    for (let game = 0; game < games; game++) {
      let count = 0;
      let gameReward = 0;
      let board = "000000000";
      let state = this.toState(board);
      let action = await this.qLearner.setState(state);
      let outcome = 0;
      while (outcome === 0 && count < limit) {
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

  private toBoard = (state: number): string => {
    return state.toString(3).padStart(9, "0");
  }

  private toState = (board: string): number => {
    return Number.parseInt(board, 3);
  }

  private getOutcome = (state: number): number => {
    // 0 = active game, 1 = player 1 win, 2 = player 2 win, 3 = draw
    const board = this.toBoard(state);
    for (let line of this.LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if (l === "111") { return 1; }
      if (l === "222") { return 2; }
    }
    for (let line of this.LINES) {
      const l = board[line[0]] + board[line[1]] + board[line[2]];
      if ( !(l.includes("1") && l.includes("2")) ) { return 0; }
    }
    return 3;
  }

  private getReward = (outcome: number): number => {
    switch (outcome) {
      case 1: return 1    // win
      case 2: return -5   // lose
      case 3:             // draw
      case 0:             // active game
      default: return -1;
    }
  }

  private place = (board: string, tile: number, player: 1 | 2): string => {
    const b = [...board];
    b[tile] = player.toString();
    return b.join("");
  }

  private placeOpponent = (board: string): string => {
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

  private updateBoard = (
    state: number,
    action: number,
    training: boolean = false,
    player: 1 | 2 = 1
  ): string => {
    let board = this.toBoard(state);
    if (board[action] !== "0") { return board; }
    board = this.place(board, action, player);
    return training ? this.placeOpponent(board) : board;
  }
}
