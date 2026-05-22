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
  selector: 'app-commission-panel',
  standalone: true,
  templateUrl: './commission-panel.component.html',
  styleUrl: './commission-panel.component.scss',
})
export class CommissionPanelComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private ctx?: gsap.Context;

  protected readonly year = new Date().getFullYear();

  @ViewChild('heading', { static: true }) heading!: ElementRef<HTMLElement>;
  @ViewChild('sub', { static: true }) sub!: ElementRef<HTMLElement>;
  @ViewChild('cta', { static: true }) cta!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: {
            trigger: this.el.nativeElement,
            start: 'left 80%',
            horizontal: true,
            containerAnimation: gsap.getById('h-scroll') as gsap.core.Tween | undefined,
          },
        })
        .from(this.heading.nativeElement, { opacity: 0, y: 40, duration: 1.4 })
        .from(this.sub.nativeElement, { opacity: 0, y: 20, duration: 1.0 }, '-=0.8')
        .from(this.cta.nativeElement, { opacity: 0, y: 16, duration: 0.9 }, '-=0.6');
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
