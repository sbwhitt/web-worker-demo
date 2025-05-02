import { Component, input } from '@angular/core';

@Component({
    selector: 'app-loading-bar',
    imports: [],
    templateUrl: './loading-bar.component.html',
    styleUrl: './loading-bar.component.scss'
})
export class LoadingBarComponent {
  message = input('loading...');
  capacity = input(0);
  progress = input(0);
}
