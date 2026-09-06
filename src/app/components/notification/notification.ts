import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class NotificationComponent {
  readonly notify = inject(NotificationService);
}
