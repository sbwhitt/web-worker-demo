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

  private initWorker(): void {
    // check for WebWorker support
    if (!window.Worker) {
      console.error("WebWorkers not supported by browser!");
      this.worker = null;
    }
    else {
      this.worker = new Worker(new URL('../workers/tictactoe.worker', import.meta.url));

      // handle worker output message
      this.worker.onmessage = ({ data }) => {
        // handle progress update
        if (typeof data === "number") {
          this.gamesFinished.set(data);
        }
        // training complete, init learner with output
        else {
          this.learner = new TicTacToeLearner(data);
          setTimeout(() => this.learnerActive.set(true), 500);
        }
      };

      // worker error handler
      this.worker.onerror = ((err) => {
        console.error("Error occurred in WebWorker: ", err);
      });
    }
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
    // backup for when WebWorker not supported/disabled
    if (!this.worker || !this.settingsService.webWorkersEnabled()) {
      this.trainLearnerNoWorker(games);
      return;
    }

    // start worker script with input
    this.worker.postMessage(games);
  }

  public startGame(piece: 1 | 2): void {
    this.gameState.set(
      this.learner.startGame(piece)
    );
  }

  public takeTurn(action: number, piece: 1 | 2): void {
    this.gameState.set(
      this.learner.takePlayerTurn(action, this.gameState().board, piece)
    );
  }

  public terminateWorker(): void {
    if (!this.worker) { return; }
    this.worker.terminate();
    this.resetLearner();
    this.initWorker();
  }

  private trainLearnerNoWorker(games: number): void {
    this.learner = new TicTacToeLearner();
    window.onmessage = ({ data }) => {
      if (typeof data === "number") {
        this.gamesFinished.set(data);
      }
    };
    this.learner.train(games);
    setTimeout(() => this.learnerActive.set(true), 500);
  }
}
