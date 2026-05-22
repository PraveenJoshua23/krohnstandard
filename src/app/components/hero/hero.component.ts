import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private ctx?: gsap.Context;

  @ViewChild('section', { static: true }) section!: ElementRef<HTMLElement>;
  @ViewChild('eyebrow', { static: true }) eyebrow!: ElementRef<HTMLElement>;
  @ViewChild('title', { static: true }) title!: ElementRef<HTMLElement>;
  @ViewChild('sub', { static: true }) sub!: ElementRef<HTMLElement>;
  @ViewChild('product', { static: true }) product!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      // Intro
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from(this.eyebrow.nativeElement, { opacity: 0, y: 18, duration: 1.2 })
        .from(
          this.title.nativeElement.querySelectorAll('.hero__line'),
          { opacity: 0, y: 48, duration: 1.4, stagger: 0.12 },
          '-=1.0',
        )
        .from(this.sub.nativeElement, { opacity: 0, y: 16, duration: 1.1 }, '-=0.9')
        .from('.hero__phone--back',  { x: 220, opacity: 0, duration: 1.3 }, '-=1.0')
        .from('.hero__phone--mid',   { x: 220, opacity: 0, duration: 1.3 }, '-=1.05')
        .from('.hero__phone--front', { x: 220, opacity: 0, duration: 1.5 }, '-=1.05');

      // Subtle parallax on the product as the page scrolls
      gsap.to(this.product.nativeElement, {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: {
          trigger: this.section.nativeElement,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, this.section.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
