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

interface Slide {
  src: string;
  webp?: string;
  alt: string;
  name: string;
}

@Component({
  selector: 'app-intro-carousel',
  standalone: true,
  templateUrl: './intro-carousel.component.html',
  styleUrl: './intro-carousel.component.scss',
})
export class IntroCarouselComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private ctx?: gsap.Context;
  private timer?: ReturnType<typeof setInterval>;
  private paused = false;

  protected activeIndex = 0;

  protected readonly slides: Slide[] = [
    { src: 'images/carousel1.png', alt: 'Sovereign series', name: 'Sovereign' },
    { src: 'images/carousel3.png', alt: 'Elysian series',   name: 'Elysian'  },
    { src: 'images/carousel4.png', alt: 'Aurelian series',  name: 'Aurelian' },
    { src: 'images/carousel2.png', alt: 'Atelier series',   name: 'Atelier'  },
  ];

  @ViewChild('section', { static: true }) section!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      const slideEls = this.slideElements();
      if (slideEls.length === 0) return;

      // Show first slide
      gsap.set(slideEls[0], { opacity: 1 });

      // Fade the whole section in on load
      gsap.from(this.section.nativeElement, {
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
      });

      this.startTimer();
    }, this.section.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.clearTimer();
  }

  protected goTo(index: number): void {
    const slides = this.slideElements();
    if (this.activeIndex === index || slides.length === 0) return;

    gsap.to(slides[this.activeIndex], { opacity: 0, duration: 1.0, ease: 'power2.inOut' });
    gsap.to(slides[index], { opacity: 1, duration: 1.0, ease: 'power2.inOut' });
    this.activeIndex = index;
    this.startTimer();
  }

  protected prev(): void {
    this.goTo((this.activeIndex - 1 + this.slides.length) % this.slides.length);
  }

  protected next(): void {
    this.goTo((this.activeIndex + 1) % this.slides.length);
  }

  protected pause(): void {
    this.paused = true;
  }

  protected resume(): void {
    this.paused = false;
  }

  private startTimer(): void {
    this.clearTimer();
    this.timer = setInterval(() => {
      if (!this.paused) {
        this.goTo((this.activeIndex + 1) % this.slides.length);
      }
    }, 4500);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private slideElements(): HTMLElement[] {
    return Array.from(
      this.el.nativeElement.querySelectorAll('.intro__slide'),
    ) as HTMLElement[];
  }
}
