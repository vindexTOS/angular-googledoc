import { Component, Input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-single-time',
  standalone: true,
  template: `
    <div
      class="chadchad"
      #drag="cdkDrag"
      cdkDrag
      [cdkDragLockAxis]="'y'"
      (cdkDragEnded)="onDragEnd($event)"
      [style.transform]="'translateY(' + Yangle + 'px)'"
      style="position: absolute;"
    >
      <p>{{ title }}</p>
    </div>
  `,
  styleUrls: ['./single-time.component.scss'],
  imports: [CdkDrag],
})
export class SingleTimeComponent {
  @Input() Yangle: number = 0;
  @Input() title: string = '';

  @Input() updatePosition: (newY: number) => void = () => {};

  // This is triggered when dragging ends
  onDragEnd(event: any) {
    
    const newY = event.dropPoint.getFreeDragPosition().y;

    
    // Call the updatePosition with the new Y angle and trigger recalculation of time slots
    this.updatePosition(newY);  
  }
}
