import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { CommissionService } from '../../core/services/commission.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-commission-modal',
  standalone: true,
  templateUrl: './commission-modal.component.html',
  styleUrl: './commission-modal.component.scss',
})
export class CommissionModalComponent implements OnDestroy {
  private readonly commissionSvc = inject(CommissionService);
  private readonly scrollSvc = inject(SmoothScrollService);

  // Signal-based DOM references (Angular 17+)
  private readonly backdropRef = viewChild<ElementRef<HTMLElement>>('backdrop');
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  // ── Service state ────────────────────────────────────────────────────────
  readonly isOpen = this.commissionSvc.isModalOpen;

  // ── Signal-based form fields ─────────────────────────────────────────────
  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly collection = signal('');
  readonly message = signal('');

  // ── UI state ─────────────────────────────────────────────────────────────
  readonly status = signal<FormStatus>('idle');
  /** True after first submit attempt — reveals validation messages. */
  readonly touched = signal(false);

  // ── Computed validation ──────────────────────────────────────────────────
  readonly nameValid = computed(() => this.name().trim().length >= 2);
  readonly emailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()),
  );
  readonly messageValid = computed(() => this.message().trim().length >= 10);

  readonly canSubmit = computed(
    () =>
      this.nameValid() &&
      this.emailValid() &&
      this.messageValid() &&
      this.status() === 'idle',
  );

  readonly collections = ['Elysian', 'Sovereign', 'Aurelian', 'Atelier'] as const;

  /** Guards against animating out before the modal has ever opened. */
  private hasOpenedOnce = false;

  constructor() {
    // React to isModalOpen changes with GSAP transitions.
    // The backdrop is always in the DOM (display:none by default), so
    // viewChild refs are available immediately — no timing issues.
    effect(() => {
      const open = this.isOpen();
      if (open) {
        this.hasOpenedOnce = true;
        this.animateIn();
      } else if (this.hasOpenedOnce) {
        this.animateOut();
      }
    });
  }

  // ── Public actions ───────────────────────────────────────────────────────

  close(): void {
    this.commissionSvc.closeModal();
  }

  /** Close when clicking the backdrop itself (not the panel). */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  submit(): void {
    this.touched.set(true);
    if (!this.canSubmit()) return;

    this.status.set('submitting');

    this.commissionSvc
      .submit({
        name: this.name(),
        email: this.email(),
        phone: this.phone().replace(/\+/g, ''),
        collection: this.collection(),
        message: this.message(),
      })
      .subscribe({
        next: () => this.status.set('success'),
        error: () => this.status.set('error'),
      });
  }

  // ── Animations ───────────────────────────────────────────────────────────

  private animateIn(): void {
    const backdrop = this.backdropRef()?.nativeElement;
    const panel = this.panelRef()?.nativeElement;
    if (!backdrop) return;

    this.scrollSvc.pause();
    document.body.style.overflow = 'hidden';

    // On mobile the backdrop is display:flex (bottom-sheet layout);
    // on desktop display:block. GSAP must set the right value.
    const isMobile = window.innerWidth <= 640;
    gsap.set(backdrop, { display: isMobile ? 'flex' : 'block', opacity: 0 });
    gsap.to(backdrop, { opacity: 1, duration: 0.35, ease: 'power2.out' });

    if (panel) {
      gsap.fromTo(
        panel,
        { y: isMobile ? 80 : 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.08 },
      );
    }
  }

  private animateOut(): void {
    const backdrop = this.backdropRef()?.nativeElement;
    const panel = this.panelRef()?.nativeElement;
    if (!backdrop) return;

    if (panel) {
      gsap.to(panel, { y: 16, opacity: 0, duration: 0.22, ease: 'power2.in' });
    }

    gsap.to(backdrop, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(backdrop, { display: 'none' });
        document.body.style.overflow = '';
        this.scrollSvc.resume();
        this.resetForm();
      },
    });
  }

  /** Reset form between sessions — preserve data on error so user can retry. */
  private resetForm(): void {
    if (this.status() === 'success') {
      this.name.set('');
      this.email.set('');
      this.phone.set('');
      this.collection.set('');
      this.message.set('');
      this.touched.set(false);
      this.status.set('idle');
    } else if (this.status() === 'error') {
      this.status.set('idle');
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
