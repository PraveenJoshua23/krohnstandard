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
  selector: 'app-materials-panel',
  standalone: true,
  templateUrl: './materials-panel.component.html',
  styleUrl: './materials-panel.component.scss',
})
export class MaterialsPanelComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private ctx?: gsap.Context;

  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLElement>;
  @ViewChild('headline', { static: true }) headline!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      const lines = this.headline.nativeElement.querySelectorAll('.mp__line');
      gsap.from(lines, {
        opacity: 0,
        yPercent: 110,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.14,
        scrollTrigger: {
          trigger: this.panel.nativeElement,
          start: 'left 80%',
          horizontal: true,
          containerAnimation: gsap.getById('h-scroll') as gsap.core.Tween | undefined,
        },
      });

      gsap.utils.toArray<HTMLElement>('.material', this.el.nativeElement).forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'expo.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: this.panel.nativeElement,
            start: 'left 70%',
            horizontal: true,
            containerAnimation: gsap.getById('h-scroll') as gsap.core.Tween | undefined,
          },
        });
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
