import { Injectable, signal, WritableSignal } from '@angular/core';
import { GameState, TicTacToeLearner } from '../helpers/TicTacToeLearner';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {
  private worker!: Worker | null;
  private learner!: TicTacToeLearner;

  public gameState: WritableSignal<GameState> = signal({
    board: "000000000",
    outcome: "active"
  })
  public learnerActive = signal(false);
  public gamesFinished = signal(0);

  constructor(
    private settingsService: SettingsService
  ) {
    this.initWorker();
  }

  public resetLearner(): void {
    this.gameState.set({
      board: "000000000",
      outcome: "active"
    });
    this.gamesFinished.set(0);
    this.learnerActive.set(false);
  }

  public trainLearner(games: number): void {
    if (!this.worker || !this.settingsService.webWorkersEnabled()) {
      this.trainLearnerNoWorker(games);
      return;
    }

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

  public terminateWorker(): void {
    if (!this.worker) { return; }
    this.worker.terminate();
    this.resetLearner();
    this.initWorker();
  }

  private initWorker(): void {
    if (!window.Worker) {
      console.error("WebWorkers not supported by browser!");
      this.worker = null;
    }
    else {
      this.worker = new Worker(new URL('../workers/tictactoe.worker', import.meta.url));
    }
  }

  private trainLearnerNoWorker(games: number): void {
    this.learner = new TicTacToeLearner();
    window.onmessage = ({ data }) => {
      if (typeof data === "number") {
        this.gamesFinished.set(data);
      }
    };
    this.learner.train(games);
    this.startGame();
    setTimeout(() => this.learnerActive.set(true), 500);
  }
}
