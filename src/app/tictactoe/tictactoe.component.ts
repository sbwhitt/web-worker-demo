import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TicTacToeService } from '../services/tictactoe.service';
import { GameBoardComponent } from "./game-board/game-board.component";
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';

@Component({
  selector: 'app-tictactoe',
  imports: [ReactiveFormsModule, GameBoardComponent, LoadingBarComponent],
  templateUrl: './tictactoe.component.html',
  styleUrl: './tictactoe.component.scss'
})
export class TictactoeComponent {
  workerEnabled = new FormControl<boolean>(true);
  trainingGames = new FormControl<number>(150000);

  constructor(
    public tictactoeService: TicTacToeService
  ) {}

  addGames(amount: number): void {
    const games = this.trainingGames.value ?? 0;
    this.trainingGames.setValue(games + amount);
  }

  trainLearner(): void {
    if (!this.trainingGames.value) { return; }
    const workerEnabled = this.workerEnabled.value ?? false;
    this.tictactoeService.trainLearner(this.trainingGames.value, workerEnabled);
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
