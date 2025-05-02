import { Component } from '@angular/core';
import { TicTacToeService } from './services/tictactoe.service';
import { GameBoardComponent } from "./game-board/game-board.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LoadingBarComponent } from './loading-bar/loading-bar.component';

@Component({
    selector: 'app-root',
    imports: [ReactiveFormsModule, GameBoardComponent, LoadingBarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  trainingGames = new FormControl<number>(10000);

  constructor(
    public tictactoeService: TicTacToeService
  ) {}

  addGames(amount: number): void {
    const games = this.trainingGames.value ?? 0;
    this.trainingGames.setValue(games + amount);
  }

  trainLearner(): void {
    if (!this.trainingGames.value) { return; }
    this.tictactoeService.trainLearner(this.trainingGames.value);
  }

  resetLearner(): void {
    this.tictactoeService.resetLearner();
  }

  playerTurn(action: number): void {
    this.tictactoeService.takeTurn(action);
  }

  newGame(): void {
    this.tictactoeService.startGame();
  }
}
