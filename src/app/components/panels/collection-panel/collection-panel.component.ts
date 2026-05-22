import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { CollectionSeries } from '../../../shared/data/collections.data';

@Component({
  selector: 'app-collection-panel',
  standalone: true,
  templateUrl: './collection-panel.component.html',
  styleUrl: './collection-panel.component.scss',
})
export class CollectionPanelComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) series!: CollectionSeries;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private ctx?: gsap.Context;
  private timer?: ReturnType<typeof setInterval>;

  protected activeIndex = 0;

  @ViewChild('label', { static: true }) labelEl!: ElementRef<HTMLElement>;
  @ViewChild('name', { static: true }) nameEl!: ElementRef<HTMLElement>;
  @ViewChild('descriptor', { static: true }) descriptorEl!: ElementRef<HTMLElement>;
  @ViewChild('imagePanel', { static: true }) imagePanel!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      const slides = Array.from(
        this.el.nativeElement.querySelectorAll('.cp__slide'),
      ) as HTMLElement[];
      if (slides.length > 0) gsap.set(slides[0], { opacity: 1 });

      if (this.series.images.length > 1) this.startTimer();
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.clearTimer();
  }

  protected goTo(index: number): void {
    const slides = Array.from(
      this.el.nativeElement.querySelectorAll('.cp__slide'),
    ) as HTMLElement[];
    if (this.activeIndex === index || slides.length === 0) return;

    gsap.to(slides[this.activeIndex], { opacity: 0, duration: 0.7, ease: 'power2.inOut' });
    gsap.to(slides[index], { opacity: 1, duration: 0.7, ease: 'power2.inOut' });
    this.activeIndex = index;
  }

  protected pauseTimer(): void {
    this.clearTimer();
  }

  protected resumeTimer(): void {
    if (this.series.images.length > 1) this.startTimer();
  }

  private startTimer(): void {
    this.clearTimer();
    this.timer = setInterval(() => {
      this.goTo((this.activeIndex + 1) % this.series.images.length);
    }, 3000);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
