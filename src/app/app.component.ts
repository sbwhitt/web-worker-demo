import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { TicTacToeService } from './services/tictactoe.service';
import { GameBoardComponent } from "./game-board/game-board.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LoadingBarComponent } from './loading-bar/loading-bar.component';
import { HeatmapComponent } from "./heatmap/heatmap.component";

@Component({
    selector: 'app-root',
    imports: [ReactiveFormsModule, GameBoardComponent, LoadingBarComponent, HeatmapComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  trainingGames = new FormControl<number>(10000);
  redrawHeatmap = new Subject<boolean>();

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
    this.redrawHeatmap.next(true);
  }

  resetLearner(): void {
    this.tictactoeService.resetLearner();
  }

  playerTurn(action: number): void {
    this.tictactoeService.takePlayerTurn(action);
    this.redrawHeatmap.next(true);
  }

  newGame(): void {
    this.tictactoeService.startGame();
  }
}
