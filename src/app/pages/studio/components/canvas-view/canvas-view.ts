import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { ThreeSceneService } from '../../../../core/services/three-scene.service';

@Component({
  selector: 'app-canvas-view',
  templateUrl: './canvas-view.html',
  styleUrl: './canvas-view.scss',
})
export class CanvasViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly scene = inject(ThreeSceneService);

  ngAfterViewInit(): void {
    this.scene.init(this.canvasRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.scene.destroy();
  }
}
