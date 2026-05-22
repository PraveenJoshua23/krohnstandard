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

@Component({
  selector: 'app-hero-v2',
  standalone: true,
  templateUrl: './hero-v2.component.html',
  styleUrl: './hero-v2.component.scss',
})
export class HeroV2Component implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private ctx?: gsap.Context;

  @ViewChild('section', { static: true }) section!: ElementRef<HTMLElement>;
  @ViewChild('quoteMark', { static: true }) quoteMark!: ElementRef<HTMLElement>;
  @ViewChild('title', { static: true }) title!: ElementRef<HTMLElement>;
  @ViewChild('manifesto', { static: true }) manifesto!: ElementRef<HTMLElement>;
  @ViewChild('cta', { static: true }) cta!: ElementRef<HTMLElement>;
  @ViewChild('imagePanel', { static: true }) imagePanel!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.documentElement.dataset['hero'] = 'dark';

    this.ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from(this.quoteMark.nativeElement, { opacity: 0, y: -20, duration: 1.1 })
        .from(this.title.nativeElement, { opacity: 0, y: 44, duration: 1.5 }, '-=0.75')
        .from(this.manifesto.nativeElement, { opacity: 0, y: 20, duration: 1.0 }, '-=0.9')
        .from(this.cta.nativeElement, { opacity: 0, y: 18, duration: 0.9 }, '-=0.75')
        .from(this.imagePanel.nativeElement, { opacity: 0, x: 60, duration: 1.7 }, '-=2.0');
    }, this.section.nativeElement);
  }

  ngOnDestroy(): void {
    delete document.documentElement.dataset['hero'];
    this.ctx?.revert();
  }
}
