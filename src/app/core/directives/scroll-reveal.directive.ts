import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Adds `is-visible` to the host element the first time it enters the
 * viewport. Pair with the `[data-reveal]` CSS defined in styles.scss.
 *
 *   <section appScrollReveal [revealDelay]="120">…</section>
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
  host: {
    'data-reveal': '',
  },
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  /** Delay before the reveal kicks in (ms). */
  @Input() revealDelay = 0;

  /** Ratio of the element that must be visible before revealing. */
  @Input() revealThreshold = 0.15;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.host.nativeElement;
    el.style.transitionDelay = `${this.revealDelay}ms`;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: this.revealThreshold, rootMargin: '0px 0px -8% 0px' },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
