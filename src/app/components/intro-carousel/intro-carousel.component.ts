import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

interface HeroSlide {
  src: string;
  alt: string;
  label: string;
  name: string;
  descriptor: string;
  number: string;
}

const SNAP_LOCK_MS    = 950;
const SNAP_DURATION_S = 0.9;
const TOUCH_THRESHOLD = 30;

@Component({
  selector: 'app-intro-carousel',
  standalone: true,
  templateUrl: './intro-carousel.component.html',
  styleUrl: './intro-carousel.component.scss',
})
export class IntroCarouselComponent implements AfterViewInit, OnDestroy {
  private readonly platformId   = inject(PLATFORM_ID);
  private readonly smoothScroll = inject(SmoothScrollService);
  private ctx?: gsap.Context;

  // ── View queries ─────────────────────────────────────────────────────────────
  private readonly wrapperEl  = viewChild<ElementRef<HTMLElement>>('wrapper');
  private readonly slideEls   = viewChildren<ElementRef<HTMLElement>>('slideEl');
  private readonly nameEls    = viewChildren<ElementRef<HTMLElement>>('nameEl');
  private readonly descEls    = viewChildren<ElementRef<HTMLElement>>('descEl');
  private readonly progressEl = viewChild<ElementRef<HTMLElement>>('progressFill');
  private readonly scrollHint = viewChild<ElementRef<HTMLElement>>('scrollHint');

  // ── State ─────────────────────────────────────────────────────────────────────
  private snapLocked   = false;
  private currentIndex = 0;
  private reducedMotion = false;

  /** Exposed to the template for prev/next button disabled state. */
  protected readonly activeIndex = signal(0);

  private wheelListener?:      (e: WheelEvent) => void;
  private touchStartListener?: (e: TouchEvent) => void;
  private touchMoveListener?:  (e: TouchEvent) => void;
  private touchEndListener?:   (e: TouchEvent) => void;
  private keyListener?:        (e: KeyboardEvent) => void;

  private touchStartY     = 0;
  private touchInCarousel = false;

  readonly slides: HeroSlide[] = [
    {
      src:        'images/carousel1.png',
      alt:        'Sovereign series — precious metal alloys',
      label:      'Sovereign I',
      name:       'Sovereign',
      descriptor: 'Precious metal alloys — gold, platinum & palladium.',
      number:     '01',
    },
    {
      src:        'images/carousel3.png',
      alt:        'Elysian series — bold lacquer finishes',
      label:      'Series 01',
      name:       'Elysian',
      descriptor: 'Bold lacquer finishes on aerospace-grade aluminium.',
      number:     '02',
    },
    {
      src:        'images/carousel4.png',
      alt:        'Aurelian series — hand-stitched leather',
      label:      'Series 02',
      name:       'Aurelian',
      descriptor: 'Hand-stitched full-grain leather on anodised frames.',
      number:     '03',
    },
    {
      src:        'images/carousel2.png',
      alt:        'Atelier series — exotic leather and precious metals',
      label:      'Sovereign II',
      name:       'Atelier',
      descriptor: 'Exotic leather married to hand-poured precious metals.',
      number:     '04',
    },
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.reducedMotion) {
      this.initReducedState();
    } else {
      this.ctx = gsap.context(() => this.initScrollSequence());
    }

    this.initSnapWheel();
    this.initKeyboard();
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    if (this.wheelListener) {
      window.removeEventListener('wheel', this.wheelListener, { capture: true } as EventListenerOptions);
    }
    if (this.touchStartListener) window.removeEventListener('touchstart', this.touchStartListener);
    if (this.touchMoveListener) {
      window.removeEventListener('touchmove', this.touchMoveListener, { capture: true } as EventListenerOptions);
    }
    if (this.touchEndListener) window.removeEventListener('touchend', this.touchEndListener);
    if (this.keyListener)      window.removeEventListener('keydown', this.keyListener);
  }

  // ── Public slide controls (used by template buttons + keyboard) ───────────────

  protected prevSlide(): void {
    this.syncIndex();
    this.goTo(this.currentIndex - 1);
  }

  protected nextSlide(): void {
    this.syncIndex();
    this.goTo(this.currentIndex + 1);
  }

  // ── Slide position helpers (extracted from closures for reuse) ────────────────

  private getSlidePositions(): number[] {
    const wrapper = this.wrapperEl()?.nativeElement;
    if (!wrapper) return [];
    const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
    return Array.from({ length: this.slides.length }, (_, i) =>
      wrapperTop + i * window.innerHeight,
    );
  }

  private syncIndex(): void {
    const positions = this.getSlidePositions();
    let closest = 0, minDist = Infinity;
    positions.forEach((p, i) => {
      const d = Math.abs(window.scrollY - p);
      if (d < minDist) { minDist = d; closest = i; }
    });
    this.currentIndex = closest;
  }

  private inCarousel(): boolean {
    if (document.body.style.overflow === 'hidden') return false;
    const positions = this.getSlidePositions();
    const n = this.slides.length;
    if (positions.length === 0) return false;
    return window.scrollY >= positions[0] - 4 &&
           window.scrollY <= positions[n - 1] + 4;
  }

  private goTo(index: number): void {
    if (this.snapLocked) return;
    const n = this.slides.length;
    const clamped = Math.max(0, Math.min(index, n - 1));
    this.currentIndex = clamped;
    this.activeIndex.set(clamped);
    this.snapLocked = true;
    this.smoothScroll.scrollTo(this.getSlidePositions()[clamped], 0, SNAP_DURATION_S);
    if (this.reducedMotion) this.showSlide(clamped);
    setTimeout(() => { this.snapLocked = false; }, SNAP_LOCK_MS);
  }

  // ── Reduced-motion: instant slide switching, no GSAP timeline ────────────────

  private initReducedState(): void {
    const slides = this.slideEls().map(r => r.nativeElement);
    const names  = this.nameEls().map(r => r.nativeElement);
    const descs  = this.descEls().map(r => r.nativeElement);
    const prog   = this.progressEl()?.nativeElement;
    const n      = slides.length;

    gsap.set(slides[0], { opacity: 1, scale: 1 });
    gsap.set(slides.slice(1), { opacity: 0, scale: 1 });
    gsap.set([names[0], descs[0]], { opacity: 1, y: 0 });
    gsap.set([...names.slice(1), ...descs.slice(1)], { opacity: 0, y: 0 });
    if (prog) gsap.set(prog, { scaleX: 1 / n, transformOrigin: 'left center' });
  }

  private showSlide(index: number): void {
    const slides = this.slideEls().map(r => r.nativeElement);
    const names  = this.nameEls().map(r => r.nativeElement);
    const descs  = this.descEls().map(r => r.nativeElement);
    const prog   = this.progressEl()?.nativeElement;
    const n      = this.slides.length;

    slides.forEach((s, i) => gsap.set(s, { opacity: i === index ? 1 : 0 }));
    names.forEach((el, i) => gsap.set(el, { opacity: i === index ? 1 : 0, y: 0 }));
    descs.forEach((el, i) => gsap.set(el, { opacity: i === index ? 1 : 0, y: 0 }));
    if (prog) gsap.set(prog, { scaleX: (index + 1) / n });
  }

  // ── Snap interception (wheel + touch) ────────────────────────────────────────

  private initSnapWheel(): void {
    const n = this.slides.length;

    this.wheelListener = (e: WheelEvent) => {
      if (!this.inCarousel()) return;
      this.syncIndex();
      const goingDown = e.deltaY > 0;
      if (goingDown && this.currentIndex >= n - 1) return;
      if (!goingDown && this.currentIndex <= 0)    return;
      e.stopImmediatePropagation();
      e.preventDefault();
      this.goTo(this.currentIndex + (goingDown ? 1 : -1));
    };

    window.addEventListener('wheel', this.wheelListener, { passive: false, capture: true });

    this.touchStartListener = (e: TouchEvent) => {
      this.touchStartY     = e.touches[0].clientY;
      this.touchInCarousel = this.inCarousel();
    };

    this.touchMoveListener = (e: TouchEvent) => {
      if (!this.touchInCarousel) return;
      const deltaY    = this.touchStartY - e.touches[0].clientY;
      const goingDown = deltaY > 0;
      if (goingDown && this.currentIndex >= n - 1) { this.touchInCarousel = false; return; }
      if (!goingDown && this.currentIndex <= 0)    { this.touchInCarousel = false; return; }
      e.stopImmediatePropagation();
      e.preventDefault();
    };

    this.touchEndListener = (e: TouchEvent) => {
      if (!this.touchInCarousel) return;
      this.touchInCarousel = false;
      const endY      = e.changedTouches[0].clientY;
      const deltaY    = this.touchStartY - endY;
      const goingDown = deltaY > 0;
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
      this.syncIndex();
      if (goingDown && this.currentIndex >= n - 1) return;
      if (!goingDown && this.currentIndex <= 0)    return;
      this.goTo(this.currentIndex + (goingDown ? 1 : -1));
    };

    window.addEventListener('touchstart', this.touchStartListener, { passive: true });
    window.addEventListener('touchmove',  this.touchMoveListener,  { passive: false, capture: true });
    window.addEventListener('touchend',   this.touchEndListener,   { passive: true });
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────────

  private initKeyboard(): void {
    const n = this.slides.length;
    this.keyListener = (e: KeyboardEvent) => {
      if (!this.inCarousel()) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (this.currentIndex >= n - 1) return;
        e.preventDefault();
        this.syncIndex();
        this.goTo(this.currentIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (this.currentIndex <= 0) return;
        e.preventDefault();
        this.syncIndex();
        this.goTo(this.currentIndex - 1);
      }
    };
    window.addEventListener('keydown', this.keyListener);
  }

  // ── Full GSAP scroll sequence (skipped when reduced-motion) ──────────────────

  private initScrollSequence(): void {
    const wrapper      = this.wrapperEl()?.nativeElement;
    const slides       = this.slideEls().map(r => r.nativeElement);
    const names        = this.nameEls().map(r => r.nativeElement);
    const descs        = this.descEls().map(r => r.nativeElement);
    const progressFill = this.progressEl()?.nativeElement;
    const hint         = this.scrollHint()?.nativeElement;

    if (!wrapper || slides.length < 4) return;

    const n = slides.length;

    gsap.set(slides[0], { opacity: 1, scale: 1 });
    gsap.set(slides.slice(1), { opacity: 0, scale: 1.06 });
    gsap.set([names[0], descs[0]], { opacity: 1, y: 0 });
    gsap.set([...names.slice(1), ...descs.slice(1)], { opacity: 0, y: 28 });
    if (progressFill) {
      gsap.set(progressFill, { scaleX: 1 / n, transformOrigin: 'left center' });
    }

    const tl = gsap.timeline();

    for (let i = 0; i < n - 1; i++) {
      const pos = i;
      tl.to(slides[i],     { opacity: 0, scale: 1.05, ease: 'none', duration: 1 }, pos)
        .to(slides[i + 1], { opacity: 1, scale: 1.0,  ease: 'none', duration: 1 }, pos);

      tl.to(names[i], { opacity: 0, y: -22, ease: 'none', duration: 0.4  }, pos + 0.05)
        .to(descs[i], { opacity: 0, y: -14, ease: 'none', duration: 0.35 }, pos + 0.1);

      tl.to(names[i + 1], { opacity: 1, y: 0, ease: 'none', duration: 0.4  }, pos + 0.55)
        .to(descs[i + 1], { opacity: 1, y: 0, ease: 'none', duration: 0.35 }, pos + 0.65);

      if (progressFill) {
        tl.to(progressFill, { scaleX: (i + 2) / n, ease: 'none', duration: 1 }, pos);
      }
    }

    ScrollTrigger.create({
      animation: tl,
      trigger:   wrapper,
      start:     'top top',
      end:       'bottom bottom',
      scrub:     0.6,
    });

    if (hint) {
      ScrollTrigger.create({
        trigger:  wrapper,
        start:    'top top',
        end:      '+=200',
        scrub:    true,
        onUpdate: (self) => {
          gsap.set(hint, { opacity: Math.max(0, 1 - self.progress * 3.5) });
        },
      });
    }

    gsap.from(slides[0], { opacity: 0, scale: 1.06, duration: 2.0, ease: 'expo.out' });
    gsap.from(names[0],  { opacity: 0, y: 36, duration: 1.4, ease: 'expo.out', delay: 0.55 });
    gsap.from(descs[0],  { opacity: 0, y: 20, duration: 1.2, ease: 'expo.out', delay: 0.75 });
  }
}
