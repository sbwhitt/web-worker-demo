import { Component } from '@angular/core';
import { TicTacToeService } from './services/tictactoe.service';
import { GameBoardComponent } from "./game-board/game-board.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, GameBoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  trainingGames = new FormControl<number>(1000);

  constructor(
    public tictactoeService: TicTacToeService
  ) {}

  trainLearner(): void {
    if (!this.trainingGames.value) { return; }
    this.tictactoeService.trainLearner(this.trainingGames.value);
  }

  resetLearner(): void {
    this.tictactoeService.resetLearner();
  }

  playerTurn(action: number): void {
    this.tictactoeService.takePlayerTurn(action);
  }

  newGame(): void {
    this.tictactoeService.startGame();
  }
}
