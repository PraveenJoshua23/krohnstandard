import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-colours',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './colours.component.html',
  styleUrl: './colours.component.scss',
})
export class ColoursComponent {}
