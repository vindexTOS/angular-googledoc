import { Component, Input } from '@angular/core';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-single-time',
  standalone: true,
  template: `
    <div
      class="chadchad"
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
  onDragEnd(event: CdkDragEnd) {
    // Get the final Y position of the dragged element
    const newY = event.source.getFreeDragPosition().y; // Get the new Y position
    
    console.log("New Y Position:", newY);
    
    // Update the position and trigger recalculation of time slots
    this.updatePosition(newY);  
  }
}
