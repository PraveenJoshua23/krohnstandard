import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-collections-grid',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './collections-grid.component.html',
  styleUrl: './collections-grid.component.scss',
})
export class CollectionsGridComponent {}
