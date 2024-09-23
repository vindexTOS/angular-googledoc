import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-single-time',
  standalone: true,
  imports: [],
  template: `
    <div class="chadchad"
        
         [style.transform]="'translateY(' + Yangle + 'px)'">
      <!-- Content goes here -->
    </div>
  `,
  styleUrls: ['./single-time.component.scss']
})
export class SingleTimeComponent {
  @Input() Yangle: string | undefined;
}