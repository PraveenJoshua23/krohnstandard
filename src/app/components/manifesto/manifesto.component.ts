import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-manifesto',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './manifesto.component.html',
  styleUrl: './manifesto.component.scss',
})
export class ManifestoComponent {}
