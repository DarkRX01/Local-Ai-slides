import { Notification, ipcMain } from 'electron';

export function showNotification(title: string, body: string): void {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      silent: false,
    });
    notification.show();
  } else {
    console.log(`Notification: ${title} - ${body}`);
  }
}

export function setupNotificationHandlers(): void {
  ipcMain.on('notification:show', (_event, title: string, body: string) => {
    showNotification(title, body);
  });
}
