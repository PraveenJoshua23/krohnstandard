import { Component, inject } from '@angular/core';
import { ScrollRevealDirective } from '../../core/directives/scroll-reveal.directive';
import { CommissionService } from '../../core/services/commission.service';

@Component({
  selector: 'app-commission',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './commission.component.html',
  styleUrl: './commission.component.scss',
})
export class CommissionComponent {
  private readonly commissionSvc = inject(CommissionService);

  openCommissionModal(): void {
    this.commissionSvc.openModal();
  }
}
