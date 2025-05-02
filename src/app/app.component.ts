import { Component } from '@angular/core';
import { TictactoeComponent } from "./tictactoe/tictactoe.component";

@Component({
    selector: 'app-root',
    imports: [TictactoeComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  
}
