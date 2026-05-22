import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ThreeSceneService,
  ConfigPart,
  MetalFinish,
  BackplateMaterial,
} from '../../../../core/services/three-scene.service';

interface ColorSwatch {
  label: string;
  hex: string;
}

interface SeriesOption {
  id: string;
  name: string;
  label: string;
  descriptor: string;
  preset: {
    bodyFinish: MetalFinish;
    bodyColor?: string;
    backplate: BackplateMaterial | MetalFinish;
    backplateColor?: string;
    antennaColor: string;
  };
  bodySection: 'color-palette' | 'metal-chips';
  backSection: 'glass-color' | 'leather-carbon' | 'none';
}

const COLOR_PALETTE: ColorSwatch[] = [
  { label: 'Bone',     hex: '#f5f3ee' },
  { label: 'Chalk',    hex: '#e8e2d5' },
  { label: 'Sand',     hex: '#c9b99a' },
  { label: 'Slate',    hex: '#8a9aa8' },
  { label: 'Forest',   hex: '#3d5c4a' },
  { label: 'Burgundy', hex: '#6b2737' },
  { label: 'Midnight', hex: '#1a1f2e' },
  { label: 'Ink',      hex: '#0a0a0a' },
];

const ANTENNA_COLORS: ColorSwatch[] = [
  { label: 'Orange',     hex: '#C8501A' },
  { label: 'Light Grey', hex: '#C0C0C0' },
  { label: 'Dark Grey',  hex: '#4A4A4A' },
  { label: 'Dark Blue',  hex: '#0D2240' },
];

const METAL_CHIPS: { id: MetalFinish; label: string }[] = [
  { id: 'platinum',  label: 'Platinum' },
  { id: 'gold',      label: 'Gold' },
  { id: 'rose-gold', label: 'Rose Gold' },
];

const SERIES: SeriesOption[] = [
  {
    id: 'elysian',
    name: 'Elysian',
    label: 'Series 01',
    descriptor: 'Bold lacquer finishes on aerospace-grade aluminium.',
    preset: {
      bodyFinish: 'color',
      bodyColor: '#0a0a0a',
      backplate: 'matte-glass',
      backplateColor: '#0a0a0a',
      antennaColor: '#4A4A4A',
    },
    bodySection: 'color-palette',
    backSection: 'glass-color',
  },
  {
    id: 'aurelian',
    name: 'Aurelian',
    label: 'Series 02',
    descriptor: 'Hand-stitched full-grain leather on anodised frames.',
    preset: {
      bodyFinish: 'color',
      bodyColor: '#c9b99a',
      backplate: 'leather',
      antennaColor: '#4A4A4A',
    },
    bodySection: 'color-palette',
    backSection: 'leather-carbon',
  },
  {
    id: 'sovereign',
    name: 'Sovereign',
    label: 'Sovereign I',
    descriptor: 'Precious metal alloys — gold, platinum & palladium.',
    preset: {
      bodyFinish: 'platinum',
      backplate: 'platinum',
      antennaColor: '#4A4A4A',
    },
    bodySection: 'metal-chips',
    backSection: 'none',
  },
  {
    id: 'atelier',
    name: 'Atelier',
    label: 'Sovereign II',
    descriptor: 'Exotic leather married to hand-poured precious metals.',
    preset: {
      bodyFinish: 'gold',
      backplate: 'leather',
      antennaColor: '#4A4A4A',
    },
    bodySection: 'metal-chips',
    backSection: 'leather-carbon',
  },
];

const BODY_PARTS: ConfigPart[] = ['body', 'camera_ring', 'buttons'];
const BACKPLATE_MATERIALS: string[] = ['matte-glass', 'leather', 'carbon'];

@Component({
  selector: 'app-config-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config-panel.html',
  styleUrl: './config-panel.scss',
})
export class ConfigPanelComponent {
  private readonly scene = inject(ThreeSceneService);

  readonly series = SERIES;
  readonly colorPalette = COLOR_PALETTE;
  readonly antennaColors = ANTENNA_COLORS;
  readonly metalChips = METAL_CHIPS;

  activeSeries: SeriesOption = SERIES[0];
  activeBodyColor = '#0a0a0a';
  activeBodyFinish: MetalFinish = 'platinum';
  backplateColor = '#0a0a0a';
  activeBackMaterial: 'leather' | 'carbon' = 'leather';
  antennaColor = '#4A4A4A';

  selectSeries(s: SeriesOption): void {
    this.activeSeries = s;
    const p = s.preset;

    if (s.bodySection === 'color-palette') {
      this.activeBodyColor = p.bodyColor ?? '#0a0a0a';
    } else {
      this.activeBodyFinish = p.bodyFinish as MetalFinish;
    }
    this.activeBackMaterial = 'leather';
    this.backplateColor = p.backplateColor ?? '#0a0a0a';
    this.antennaColor = p.antennaColor;

    if (p.bodyFinish === 'color') {
      BODY_PARTS.forEach(part => this.scene.setFinish(part, 'color', p.bodyColor));
    } else {
      BODY_PARTS.forEach(part => this.scene.setFinish(part, p.bodyFinish));
    }

    if (BACKPLATE_MATERIALS.includes(p.backplate)) {
      this.scene.setBackplateMaterial(p.backplate as BackplateMaterial, p.backplateColor);
    } else {
      this.scene.setFinish('backplate', p.backplate as MetalFinish);
    }

    this.scene.setAntennaColor(p.antennaColor);
  }

  selectBodyColor(hex: string): void {
    this.activeBodyColor = hex;
    BODY_PARTS.forEach(p => this.scene.setFinish(p, 'color', hex));
  }

  selectBodyFinish(finish: MetalFinish): void {
    this.activeBodyFinish = finish;
    BODY_PARTS.forEach(p => this.scene.setFinish(p, finish));
    if (this.activeSeries.id === 'sovereign') {
      this.scene.setFinish('backplate', finish);
    }
  }

  selectBackMaterial(type: 'leather' | 'carbon'): void {
    this.activeBackMaterial = type;
    this.scene.setBackplateMaterial(type);
  }

  selectBackGlassColor(hex: string): void {
    this.backplateColor = hex;
    this.scene.setBackplateMaterial('matte-glass', hex);
  }

  selectAntennaColor(hex: string): void {
    this.antennaColor = hex;
    this.scene.setAntennaColor(hex);
  }
}
