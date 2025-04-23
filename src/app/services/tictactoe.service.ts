import { computed, Injectable, OnDestroy, Signal, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { QLearner } from '../helpers/TicTacToeLearner';

export type Outcome = "win" | "lose" | "draw" | "active";

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService implements OnDestroy {
  private subs: Subscription[] = [];
  private worker = new Worker(new URL('../workers/tictactoe.worker', import.meta.url));
  private learner!: QLearner;
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
  public learnerActive = signal(false);
  public gamesFinished = signal(0);

  constructor() {}

  public resetLearner(): void {
    this.currentBoard.set("000000000");
    this.gamesFinished.set(0);
    this.learnerActive.set(false);
  }

  public trainLearner(games: number): void {
    this.worker.onmessage = ({ data }) => {
      if (typeof data === "number") {
        this.gamesFinished.set(data);
      }
      else {
        this.learner = new QLearner({ Q: data });
        this.startGame();
        this.learnerActive.set(true);
      }
    };
    this.worker.postMessage(games);
  }

  public startGame(): void {
    this.currentBoard.set("000000000");
    this.learner.setState(this.toState(this.currentBoard()));
    this.takeLearnerTurn();
  }

  public takePlayerTurn(action: number): void {
    this.currentBoard.set(
      this.updateBoard(this.toState(this.currentBoard()), action, false, 2)
    );
    if (this.currentOutcome() !== "active") { return; }
    this.takeLearnerTurn();
  }

  private takeLearnerTurn(): void {
    let newBoard = this.currentBoard();
    const limit = 1000;
    let count = 0;
    while (newBoard == this.currentBoard() && count < limit) {
      let state = this.toState(this.currentBoard());
      let reward = this.getReward(this.getOutcome(state));
      const learnerAction = this.learner.query(state, reward, false);
      newBoard = this.updateBoard(state, learnerAction, false, 1);
      count++;
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

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
