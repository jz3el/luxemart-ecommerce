import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<NotificationMessage[]>([]);
  private defaultDuration = 5000; // 5 seconds

  constructor() {}

  getNotifications(): Observable<NotificationMessage[]> {
    return this.notifications$.asObservable();
  }

  success(title: string, message: string, duration?: number): void {
    this.addNotification('success', title, message, duration);
  }

  error(title: string, message: string, duration?: number): void {
    this.addNotification('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number): void {
    this.addNotification('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number): void {
    this.addNotification('info', title, message, duration);
  }

  private addNotification(type: NotificationMessage['type'], title: string, message: string, duration?: number): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: duration || this.defaultDuration,
      timestamp: new Date()
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, notification]);

    // Auto remove after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(updatedNotifications);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}