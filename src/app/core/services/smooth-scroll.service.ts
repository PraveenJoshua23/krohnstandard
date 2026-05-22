import { DOCUMENT, Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Lenis + GSAP/ScrollTrigger integration.
 * Initialised once at app bootstrap; every component can animate on scroll
 * either via the ScrollReveal directive or by importing GSAP directly.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private lenis?: Lenis;

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      });

      // Bridge Lenis <-> ScrollTrigger
      this.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => this.lenis?.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    });
  }

  scrollTo(target: string | number | HTMLElement, offset = 0): void {
    this.lenis?.scrollTo(target, { offset });
  }

  pause(): void {
    this.lenis?.stop();
  }

  resume(): void {
    this.lenis?.start();
  }

  destroy(): void {
    this.lenis?.destroy();
    this.lenis = undefined;
  }
}
