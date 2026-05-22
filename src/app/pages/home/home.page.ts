import { Component } from '@angular/core';
import { IntroCarouselComponent } from '../../components/intro-carousel/intro-carousel.component';
import { ManifestoComponent } from '../../components/manifesto/manifesto.component';
import { CollectionsGridComponent } from '../../components/collections-grid/collections-grid.component';
import { MaterialsComponent } from '../../components/materials/materials.component';
import { ColoursComponent } from '../../components/colours/colours.component';
import { CommissionComponent } from '../../components/commission/commission.component';
import { CustomiseComponent } from '../../components/customise/customise.component';
import { ClosingComponent } from '../../components/closing/closing.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IntroCarouselComponent,
    ManifestoComponent,
    CollectionsGridComponent,
    MaterialsComponent,
    ColoursComponent,
    CommissionComponent,
    CustomiseComponent,
    ClosingComponent,
  ],
  templateUrl: './home.page.html',
})
export class HomePage {}
