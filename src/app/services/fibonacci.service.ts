import { Injectable, signal } from '@angular/core';
import { SettingsService } from './settings.service';

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

  constructor(
    private settingsService: SettingsService
  ) {
    this.initWorker();
  }

  public findNumber(num: number): void {
    this.running.set(true);
    if (!this.worker || !this.settingsService.webWorkersEnabled()) {
      this.findNumberNoWorker(num);
      return;
    }
    this.worker.onmessage = (({ data }) => {
      this.result.set(data);
      this.running.set(false);
    });
    this.worker.postMessage(num);
  }

  public terminateWorker(): void {
    if (!this.worker) { return; }
    this.worker.terminate();
    this.result.set(0);
    this.running.set(false);
  }

  private initWorker(): void {
    if (!window.Worker) {
      console.error("WebWorkers not supported by browser!");
      this.worker = null;
    }
    else {
      this.worker = new Worker(new URL('../workers/fibonacci.worker', import.meta.url));
    }
  }

  private findNumberNoWorker(num: number): void {
    this.result.set(fibonacci(num));
    this.running.set(false);
  }
}
