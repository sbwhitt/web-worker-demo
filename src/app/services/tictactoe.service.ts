import { Injectable, signal, WritableSignal } from '@angular/core';
import { GameState, TicTacToeLearner } from '../helpers/TicTacToeLearner';

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {
  private worker = new Worker(new URL('../workers/tictactoe.worker', import.meta.url));
  private learner!: TicTacToeLearner;

  public gameState: WritableSignal<GameState> = signal({
    board: "000000000",
    outcome: "active"
  })
  public learnerActive = signal(false);
  public gamesFinished = signal(0);

  constructor() {}

  public resetLearner(): void {
    this.gameState.set({
      board: "000000000",
      outcome: "active"
    });
    this.gamesFinished.set(0);
    this.learnerActive.set(false);
  }

  public trainLearner(games: number): void {
    this.worker.onmessage = ({ data }) => {
      if (typeof data === "number") {
        this.gamesFinished.set(data);
      }
      else {
        this.learner = new TicTacToeLearner(data);
        this.startGame();
        setTimeout(() => this.learnerActive.set(true), 500);
      }
    };
    this.worker.postMessage(games);
  }

  public startGame(): void {
    this.gameState.set(
      this.learner.startGame()
    );
  }

  public takeTurn(action: number): void {
    this.gameState.set(
      this.learner.takePlayerTurn(action, this.gameState().board)
    );
  }
}
