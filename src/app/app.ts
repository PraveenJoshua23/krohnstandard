import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { SmoothScrollService } from './core/services/smooth-scroll.service';
import { CommissionModalComponent } from './components/commission-modal/commission-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, FooterComponent, CommissionModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly scroll = inject(SmoothScrollService);

  ngOnInit(): void {
    this.scroll.init();
  }

  ngOnDestroy(): void {
    this.scroll.destroy();
  }
}
