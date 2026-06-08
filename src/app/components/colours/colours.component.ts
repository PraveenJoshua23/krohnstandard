import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

@Component({
  selector: 'app-colours',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './colours.component.html',
  styleUrl: './colours.component.scss',
})
export class ColoursComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly stripEl   = viewChild<ElementRef<HTMLElement>>('colourStrip');
  private readonly dotEls    = viewChildren<ElementRef<HTMLElement>>('stripDot');

  private scrollListener?: () => void;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initDots();
  }

  ngOnDestroy(): void {
    const strip = this.stripEl()?.nativeElement;
    if (strip && this.scrollListener) {
      strip.removeEventListener('scroll', this.scrollListener);
    }
  }

  private initDots(): void {
    const strip = this.stripEl()?.nativeElement;
    if (!strip) return;

    const updateDots = () => {
      const dots  = this.dotEls().map(d => d.nativeElement);
      if (!dots.length) return;
      const chipW  = strip.scrollWidth / 10;
      const active = Math.round(strip.scrollLeft / chipW);
      dots.forEach((dot, i) => {
        dot.style.background = i === active
          ? 'rgba(201, 168, 76, 0.9)'
          : 'rgba(201, 168, 76, 0.25)';
        dot.style.transform  = i === active ? 'scale(1.5)' : 'scale(1)';
        dot.style.transition = 'background 0.3s, transform 0.3s';
      });
    };

    this.scrollListener = updateDots;
    strip.addEventListener('scroll', updateDots, { passive: true });
    updateDots(); // set initial state
  }
}
