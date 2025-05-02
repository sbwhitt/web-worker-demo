import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-game-board',
    imports: [],
    templateUrl: './game-board.component.html',
    styleUrl: './game-board.component.scss'
})
export class GameBoardComponent {
  tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  board = input("000000000");
  outcome = input("active");
  playerMove = output<number>();

  handlePlayerAction(action: number): void {
    if (this.board()[action] !== "0") { return; }
    this.playerMove.emit(action);
  }
}
