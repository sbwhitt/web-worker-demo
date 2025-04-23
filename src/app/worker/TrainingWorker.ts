import { Observable, Subject } from 'rxjs';
import { TicTacToeLearner } from './TicTacToeLearner';

export class TrainingWorker {
  private worker!: Worker;
  private onMessage = new Subject<MessageEvent>();
  private onError = new Subject<ErrorEvent>();
  private url!: string;

  constructor() {
    const func = TicTacToeLearner.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '');
    this.url = URL.createObjectURL(
      new Blob([ func ], { type: "text/javascript" })
    );
  }

  run(): void {
    this.worker = new Worker(this.url);

    this.worker.onmessage = (data: any) => {
      this.onMessage.next(data);
    };

    this.worker.onerror = (data: any) => {
      this.onError.next(data);
    };
  }

  postMessage(data: any): void {
    this.worker.postMessage(data);
  }

  onmessage(): Observable<MessageEvent> {
    return this.onMessage.asObservable();
  }

  onerror(): Observable<ErrorEvent> {
    return this.onError.asObservable();
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
