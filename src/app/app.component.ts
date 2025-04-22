import { Component } from '@angular/core';
import { TicTacToeService } from './services/tictactoe.service';
import { GameBoardComponent } from "./game-board/game-board.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameBoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  trained = false;

  constructor(
    public tictactoeService: TicTacToeService
  ) {}

  trainLearner(): void {
    this.tictactoeService.trainLearner(1000).then(() => {
      this.trained = true;
      return this.tictactoeService.startGame();
    });
  }

  resetLearner(): void {
    this.tictactoeService.resetLearner();
    this.trained = false;
  }

  playerTurn(action: number): void {
    this.tictactoeService.takePlayerTurn(action);
  }

  newGame(): void {
    this.tictactoeService.startGame();
  }
}
