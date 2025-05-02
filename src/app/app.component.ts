import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TictactoeComponent } from "./tictactoe/tictactoe.component";
import { FibonacciComponent } from "./fibonacci/fibonacci.component";
import { SettingsService } from './services/settings.service';

@Component({
    selector: 'app-root',
    imports: [ReactiveFormsModule, TictactoeComponent, FibonacciComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  enableWebWorkers = new FormControl<boolean>(true);

  constructor(
    public settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.enableWebWorkers.valueChanges.subscribe((value) => this.toggleWebWorkers(value));
  }

  toggleWebWorkers(value: boolean | null): void {
    if (value === null) { return; }
    this.settingsService.webWorkersEnabled.set(value);
  }
}
