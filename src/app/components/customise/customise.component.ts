import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-customise',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './customise.component.html',
  styleUrl: './customise.component.scss',
})
export class CustomiseComponent {}
