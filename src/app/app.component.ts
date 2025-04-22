import { Component } from '@angular/core';
import { TicTacToeService } from './services/tictactoe.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(
    public tictactoeService: TicTacToeService
  ) {}

  train(): void {
    this.tictactoeService.train(1000);
  }
}
