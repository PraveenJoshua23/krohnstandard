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
  selector: 'app-editorial',
  standalone: true,
  templateUrl: './editorial.component.html',
  styleUrl: './editorial.component.scss',
})
export class EditorialComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private ctx?: gsap.Context;

  @ViewChild('section', { static: true }) section!: ElementRef<HTMLElement>;
  @ViewChild('img', { static: true }) img!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      gsap.fromTo(
        this.img.nativeElement,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: this.section.nativeElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }, this.section.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
