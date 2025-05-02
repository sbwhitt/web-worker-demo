import { Component } from '@angular/core';
import { TictactoeComponent } from "./tictactoe/tictactoe.component";
import { FibonacciComponent } from "./fibonacci/fibonacci.component";

@Component({
    selector: 'app-root',
    imports: [TictactoeComponent, FibonacciComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  
}
