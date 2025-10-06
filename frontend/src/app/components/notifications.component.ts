import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMessage } from '../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div *ngFor="let notification of notifications" 
           class="notification" 
           [ngClass]="'notification-' + notification.type"
           [@slideIn]>
        <div class="notification-content">
          <div class="d-flex align-items-start">
            <div class="notification-icon me-3">
              <i class="bi" [ngClass]="{
                'bi-check-circle-fill text-success': notification.type === 'success',
                'bi-exclamation-triangle-fill text-warning': notification.type === 'warning',
                'bi-x-circle-fill text-danger': notification.type === 'error',
                'bi-info-circle-fill text-info': notification.type === 'info'
              }"></i>
            </div>
            <div class="flex-grow-1">
              <h6 class="notification-title mb-1">{{ notification.title }}</h6>
              <p class="notification-message mb-0">{{ notification.message }}</p>
            </div>
            <button type="button" 
                    class="btn-close btn-close-white ms-3" 
                    (click)="removeNotification(notification.id)">
            </button>
          </div>
        </div>
        <div class="notification-progress" 
             [style.animation-duration.ms]="notification.duration">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }
    
    .notification {
      background: linear-gradient(145deg, var(--charcoal), var(--deep-black));
      border: 1px solid rgba(0,255,136,0.3);
      border-radius: 10px;
      margin-bottom: 10px;
      padding: 0;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      overflow: hidden;
      position: relative;
      animation: slideIn 0.3s ease-out;
    }
    
    .notification-content {
      padding: 16px;
    }
    
    .notification-title {
      color: #ffffff;
      font-weight: 600;
    }
    
    .notification-message {
      color: #adb5bd;
      font-size: 0.9rem;
    }
    
    .notification-icon {
      font-size: 1.5rem;
    }
    
    .notification-progress {
      height: 3px;
      background: var(--primary-green);
      width: 100%;
      animation: progress linear forwards;
      position: absolute;
      bottom: 0;
      left: 0;
    }
    
    .notification-success {
      border-left: 4px solid #28a745;
    }
    
    .notification-error {
      border-left: 4px solid #dc3545;
    }
    
    .notification-warning {
      border-left: 4px solid #ffc107;
    }
    
    .notification-info {
      border-left: 4px solid #17a2b8;
    }
    
    .btn-close-white {
      filter: invert(1) grayscale(100%) brightness(200%);
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
    
    @media (max-width: 768px) {
      .notification-container {
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}