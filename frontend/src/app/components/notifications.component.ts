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
      background: var(--gradient-card);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      margin-bottom: 12px;
      padding: 0;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
      overflow: hidden;
      position: relative;
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(20px);
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
      background: var(--gradient-tertiary);
      width: 100%;
      animation: progress linear forwards;
      position: absolute;
      bottom: 0;
      left: 0;
      border-radius: 0 0 16px 16px;
    }
    
    .notification-success {
      border-left: 4px solid var(--accent-green);
    }
    
    .notification-success .notification-progress {
      background: var(--accent-green);
    }
    
    .notification-error {
      border-left: 4px solid var(--accent-pink);
    }
    
    .notification-error .notification-progress {
      background: var(--accent-pink);
    }
    
    .notification-warning {
      border-left: 4px solid var(--accent-orange);
    }
    
    .notification-warning .notification-progress {
      background: var(--accent-orange);
    }
    
    .notification-info {
      border-left: 4px solid var(--accent-blue);
    }
    
    .notification-info .notification-progress {
      background: var(--accent-blue);
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