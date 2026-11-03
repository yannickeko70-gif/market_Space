import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../constants/app.constants';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.html',
})
export class FooterComponent {
  protected readonly categories = inject(DataService).categories;
  protected readonly siteName = APP_CONFIG.siteName;
  protected readonly year = new Date().getFullYear();
}
