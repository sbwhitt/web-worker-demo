import { Component, effect, Inject, input, OnInit, Signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-heatmap',
    imports: [],
    templateUrl: './heatmap.component.html',
    styleUrl: './heatmap.component.scss'
})
export class HeatmapComponent implements OnInit {
  subs = [];
  qTable = input<number[][]>([]);
  redraw = input<Subject<boolean>>();

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.drawHeatmap();
    this.redraw()?.subscribe(() => this.drawHeatmap());
  }

  softmax(l: number[]): number[] {
    const sum = l.map((a) => Math.exp(a)).reduce((a, b) => a+b, 0);
    return l.map((v) => Math.exp(v) / sum);
  }

  getColors(actions: number[]) {
    const s = this.softmax([
      actions.slice(0, 3).reduce((a, b) => a + b, 0),
      actions.slice(3, 6).reduce((a, b) => a + b, 0),
      actions.slice(6, 9).reduce((a, b) => a + b, 0)
    ])
    const r = s[0]*512;
    const g = s[1]*512;
    const b = s[2]*512;
    return { r, g, b};
  }

  drawHeatmap(): void {
    console.log("draw");
    const canvas: HTMLCanvasElement = this.document.getElementById("heatmap") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) { return; }
    const width = Math.ceil(Math.sqrt(this.qTable().length));
    context.clearRect(0, 0, width, width);
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < width; j++) {
        const index = (i*width) + j;
        if (index >= this.qTable().length) { return; }
        const actions = this.qTable()[index];
        const {r, g, b} = this.getColors(actions);
        context.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        context.fillRect(i, j, 1, 1);
      }
    }
  }
}
