import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ThreeSceneService } from '../../core/services/three-scene.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { CanvasViewComponent } from './components/canvas-view/canvas-view';
import { ConfigPanelComponent } from './components/config-panel/config-panel';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CanvasViewComponent, ConfigPanelComponent],
  providers: [ThreeSceneService],
  templateUrl: './studio.page.html',
  styleUrl: './studio.page.scss',
})
export class StudioPage implements OnInit, OnDestroy {
  private readonly scroll = inject(SmoothScrollService);

  ngOnInit(): void {
    this.scroll.pause();
  }

  ngOnDestroy(): void {
    this.scroll.resume();
  }
}
