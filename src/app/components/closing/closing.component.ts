import { Component, inject } from '@angular/core';
import { CommissionService } from '../../core/services/commission.service';

@Component({
  selector: 'app-closing',
  standalone: true,
  templateUrl: './closing.component.html',
  styleUrl: './closing.component.scss',
})
export class ClosingComponent {
  private readonly commissionSvc = inject(CommissionService);

  openCommissionModal(): void {
    this.commissionSvc.openModal();
  }
}
