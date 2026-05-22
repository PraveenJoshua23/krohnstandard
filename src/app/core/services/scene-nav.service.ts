import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScrollService } from './smooth-scroll.service';

export interface PanelMeta {
  id: string;
  label: string;
  group: 'home' | 'collection' | 'materials' | 'commission';
}

export const PANELS: PanelMeta[] = [
  { id: 'home',      label: 'Home',       group: 'home' },
  { id: 'elysian',   label: 'Elysian',    group: 'collection' },
  { id: 'sovereign', label: 'Sovereign',  group: 'collection' },
  { id: 'aurelian',  label: 'Aurelian',   group: 'collection' },
  { id: 'atelier',   label: 'Atelier',    group: 'collection' },
  { id: 'materials', label: 'Materials',  group: 'materials' },
  { id: 'commission',label: 'Commission', group: 'commission' },
];

@Injectable({ providedIn: 'root' })
export class SceneNavService {
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly platformId = inject(PLATFORM_ID);
  private st?: ScrollTrigger;

  readonly panels = PANELS;
  readonly totalPanels = PANELS.length;

  readonly activePanel = signal(0);
  readonly activeGroup = computed(() => PANELS[this.activePanel()].group);
  readonly isCollection = computed(() => this.activeGroup() === 'collection');
  readonly activeSeriesLabel = computed(() =>
    this.isCollection() ? PANELS[this.activePanel()].label : '',
  );

  registerTrigger(st: ScrollTrigger): void {
    this.st = st;
  }

  setActivePanel(n: number): void {
    const clamped = Math.max(0, Math.min(n, this.totalPanels - 1));
    if (this.activePanel() !== clamped) this.activePanel.set(clamped);
  }

  navigateTo(panelIndex: number): void {
    if (!isPlatformBrowser(this.platformId) || !this.st) return;
    const progress = panelIndex / (this.totalPanels - 1);
    const targetY = this.st.start + progress * (this.st.end - this.st.start);
    this.smoothScroll.scrollTo(targetY);
  }
}
