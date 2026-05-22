export interface SeriesImage {
  webp: string;
  png: string;
}

export interface CollectionSeries {
  id: string;
  label: string;
  name: string;
  descriptor: string;
  images: SeriesImage[];
  theme: SeriesTheme;
}

export interface SeriesTheme {
  panelBg: string;
  textColor: string;
  accentColor: string;
  isDark: boolean;
}

export const COLLECTION_SERIES: CollectionSeries[] = [
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
    theme: {
      panelBg: '#f5f3ee',
      textColor: '#0a0a0a',
      accentColor: '#8a8880',
      isDark: false,
    },
  },
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
    theme: {
      panelBg: '#1c1408',
      textColor: '#f5f3ee',
      accentColor: '#c8a24a',
      isDark: true,
    },
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
    ],
    theme: {
      panelBg: '#1a110c',
      textColor: '#f5f3ee',
      accentColor: '#c9956a',
      isDark: true,
    },
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
    theme: {
      panelBg: '#0a0a0a',
      textColor: '#f5f3ee',
      accentColor: '#c8a24a',
      isDark: true,
    },
  },
];
