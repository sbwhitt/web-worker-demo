import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FibonacciService } from '../services/fibonacci.service';
import { SpinnerComponent } from './spinner/spinner.component';

@Component({
  selector: 'app-fibonacci',
  imports: [ReactiveFormsModule, SpinnerComponent],
  templateUrl: './fibonacci.component.html',
  styleUrl: './fibonacci.component.scss'
})
export class FibonacciComponent {
  fibNumber = new FormControl<number>(40);

  constructor(
    public fibonacciService: FibonacciService
  ) {}

  addNumber(amount: number): void {
    const num = this.fibNumber.value ?? 0;
    this.fibNumber.setValue(num + amount);
  }

  findNumber(): void {
    if (!this.fibNumber.value) { return; }
    this.fibonacciService.findNumber(this.fibNumber.value);
  }
}
