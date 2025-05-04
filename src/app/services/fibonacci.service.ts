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

  private initWorker(): void {
    // check for WebWorker support
    if (!window.Worker) {
      console.error("WebWorkers not supported by browser!");
      this.worker = null;
    }
    else {
      this.worker = new Worker(new URL('../workers/fibonacci.worker', import.meta.url));
    }
  }

  public findNumber(num: number): void {
    this.running.set(true);

    // backup for when WebWorker not supported/disabled
    if (!this.worker || !this.settingsService.webWorkersEnabled()) {
      this.result.set(fibonacci(num));
      this.running.set(false);
      return;
    }

    // handle worker output message
    this.worker.onmessage = (({ data }) => {
      this.result.set(data);
      this.running.set(false);
    });

    // worker error handler
    this.worker.onerror = ((err) => {
      console.error("Error occurred in WebWorker: ", err);
    });

    // start worker script with input
    this.worker.postMessage(num);
  }

  public terminateWorker(): void {
    if (!this.worker) { return; }
    this.worker.terminate();
    this.result.set(0);
    this.running.set(false);
    this.initWorker();
  }
}
