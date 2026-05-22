import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-atelier',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './atelier.component.html',
  styleUrl: './atelier.component.scss',
})
export class AtelierComponent {
  protected readonly steps = [
    { n: '01', title: 'Conversation', copy: 'A private brief with our design lead — constraints, context, and intent.' },
    { n: '02', title: 'Drawing', copy: 'Hand renderings and material samples are prepared for your approval.' },
    { n: '03', title: 'Making', copy: 'Each piece is assembled by a single craftsman, start to finish.' },
    { n: '04', title: 'Delivery', copy: 'Presented in a hand-finished case, with a signed certificate of origin.' },
  ];
}
