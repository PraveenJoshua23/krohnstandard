import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';

interface SeriesImage {
  webp: string;
  png: string;
}

interface Series {
  id: string;
  label: string;
  name: string;
  descriptor: string;
  images: SeriesImage[];
  placeholder: string;
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private ctx?: gsap.Context;
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();
  protected readonly activeIndex = new Map<string, number>();

  protected readonly standardSeries: Series[] = [
    {
      id: 'kaleidoscope',
      label: 'Series 01',
      name: 'Elysian',
      descriptor: 'Bold lacquer finishes on aerospace-grade aluminium.',
      images: [
        { webp: 'images/collection-kaleidoscope-1.webp', png: 'images/collection-kaleidoscope-1.png' },
        { webp: 'images/collection-kaleidoscope-2.webp', png: 'images/collection-kaleidoscope-2.png' },
        { webp: 'images/collection-kaleidoscope-3.webp', png: 'images/collection-kaleidoscope-3.png' },
         { webp: 'images/collection-kaleidoscope-4.webp', png: 'images/collection-kaleidoscope-4.png' },
      ],
      placeholder: 'linear-gradient(135deg, #b8cdd6 0%, #e0c9b4 100%)',
    },
    {
      id: 'cuir-spectrum',
      label: 'Series 02',
      name: 'Aurelian',
      descriptor: 'Hand-stitched full-grain leather on anodised frames.',
      images: [
        { webp: 'images/collection-cuir-spectrum-1.webp', png: 'images/collection-cuir-spectrum-1.png' },
        { webp: 'images/collection-cuir-spectrum-2.webp', png: 'images/collection-cuir-spectrum-2.png' },
        { webp: 'images/collection-cuir-spectrum-3.webp', png: 'images/collection-cuir-spectrum-3.png' },
         { webp: 'images/collection-cuir-spectrum-4.webp', png: 'images/collection-cuir-spectrum-4.png' },
          // { webp: 'images/collection-cuir-spectrum-5.webp', png: 'images/collection-cuir-spectrum-5.png' },
      ],
      placeholder: 'linear-gradient(135deg, #c9956a 0%, #7a4a2a 100%)',
    },
  ];

  protected readonly sovereignSeries: Series[] = [
    {
      id: 'krohn',
      label: 'Sovereign I',
      name: 'Sovereign',
      descriptor: 'Precious metal alloys — gold, platinum & palladium.',
      images: [
        { webp: 'images/collection-krohn-1.webp', png: 'images/collection-krohn-1.png' },
        { webp: 'images/collection-krohn-2.webp', png: 'images/collection-krohn-2.png' },
        { webp: 'images/collection-krohn-3.webp', png: 'images/collection-krohn-3.png' },
      ],
      placeholder: 'linear-gradient(135deg, #c8a24a 0%, #7a5a1e 100%)',
    },
    {
      id: 'atelier',
      label: 'Sovereign II',
      name: 'Atelier',
      descriptor: 'Exotic leather married to hand-poured precious metals.',
      images: [
        { webp: 'images/collection-atelier-1.webp', png: 'images/collection-atelier-1.png' },
        { webp: 'images/collection-atelier-2.webp', png: 'images/collection-atelier-2.png' },
        { webp: 'images/collection-atelier-3.webp', png: 'images/collection-atelier-3.png' },
         { webp: 'images/collection-atelier-4.webp', png: 'images/collection-atelier-4.png' },
      ],
      placeholder: 'linear-gradient(135deg, #4a3020 0%, #1c0e08 100%)',
    },
  ];

  private get allSeries(): Series[] {
    return [...this.standardSeries, ...this.sovereignSeries];
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      for (const series of this.allSeries) {
        this.activeIndex.set(series.id, 0);

        const container = this.el.nativeElement.querySelector(`[data-carousel="${series.id}"]`);
        if (!container) continue;

        const slides = Array.from(container.querySelectorAll('.carousel__slide')) as HTMLElement[];
        if (slides.length === 0) continue;

        gsap.set(slides[0], { opacity: 1 });
        this.startTimer(series);
      }
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    for (const timer of this.timers.values()) clearInterval(timer);
    this.timers.clear();
  }

  protected goTo(seriesId: string, index: number): void {
    const container = this.el.nativeElement.querySelector(`[data-carousel="${seriesId}"]`);
    if (!container) return;

    const slides = Array.from(container.querySelectorAll('.carousel__slide')) as HTMLElement[];
    const from = this.activeIndex.get(seriesId) ?? 0;
    if (from === index || slides.length === 0) return;

    gsap.to(slides[from], { opacity: 0, duration: 0.7, ease: 'power2.inOut' });
    gsap.to(slides[index], { opacity: 1, duration: 0.7, ease: 'power2.inOut' });
    this.activeIndex.set(seriesId, index);
  }

  protected pauseTimer(seriesId: string): void {
    const timer = this.timers.get(seriesId);
    if (timer !== undefined) clearInterval(timer);
    this.timers.delete(seriesId);
  }

  protected resumeTimer(seriesId: string): void {
    const series = this.allSeries.find(s => s.id === seriesId);
    if (series) this.startTimer(series);
  }

  private startTimer(series: Series): void {
    if (series.images.length <= 1) return;
    const timer = setInterval(() => {
      const current = this.activeIndex.get(series.id) ?? 0;
      this.goTo(series.id, (current + 1) % series.images.length);
    }, 3000);
    this.timers.set(series.id, timer);
  }
}
