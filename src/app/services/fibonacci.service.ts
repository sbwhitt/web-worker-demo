import { Injectable, signal } from '@angular/core';

export function fibonacci(n: number): number {
  if (n < 0) { throw Error("Invalid value!"); }
  if (n == 0) { return 0; }
  if (n == 1) { return 1; }
  return fibonacci(n - 2) + fibonacci(n - 1);
}

@Injectable({
  providedIn: 'root'
})
export class FibonacciService {
  private worker!: Worker | null;

  public running = signal(false);
  public result = signal(0);
  public progress = signal(0);

  constructor() {
    if (!window.Worker) {
      console.log("WebWorkers not supported by browser!");
      this.worker = null;
    }
    else {
      this.worker = new Worker(new URL('../workers/fibonacci.worker', import.meta.url));
    }
  }

  public findNumber(num: number): void {
    this.running.set(true);
    if (!this.worker) {
      this.findNumberNoWorker(num);
      return;
    }
    this.worker.onmessage = (({ data }) => {
      this.result.set(data);
      this.running.set(false);
    });
    this.worker.postMessage(num);
  }

  private findNumberNoWorker(num: number): void {
    this.result.set(fibonacci(num));
    this.running.set(false);
  }
}
