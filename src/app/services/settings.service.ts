import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public webWorkersEnabled = signal(true);

  constructor() {}
}
