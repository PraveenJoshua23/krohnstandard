import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommissionService } from '../../core/services/commission.service';

const INTRO_CAROUSEL_DEPTH = () => window.innerHeight * 4;

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  private readonly commissionSvc = inject(CommissionService);

  protected readonly scrolled  = signal(false);
  protected readonly menuOpen  = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > INTRO_CAROUSEL_DEPTH());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  protected toggleMenu(): void {
    this.menuOpen() ? this.closeMenu() : this.openMenu();
  }

  protected openMenu(): void {
    this.menuOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
    document.body.style.overflow = '';
  }

  protected openContact(): void {
    this.commissionSvc.openModal();
  }

  protected openContactFromMenu(): void {
    this.closeMenu();
    // Allow overlay close transition to complete before modal opens.
    setTimeout(() => this.commissionSvc.openModal(), 320);
  }
}
