import { useEffect } from 'react';
import { toast } from 'sonner';

export const useNotification = () => {
  useEffect(() => {
    // Request permission for browser notifications
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const eventSource = new EventSource('http://localhost:5000/api/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'reminder') {
          const message = payload.data.message;

          // Show Web Notification (Toast)
          toast.info('Nhắc nhở lịch dạy', {
            description: message,
            duration: 10000,
          });

          // Show Browser Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nhắc nhở lịch dạy', {
              body: message,
              icon: '/favicon.ico', // Change if there's a specific icon
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse SSE message', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
      // Optionally reconnect logic can be added here
    };

    return () => {
      eventSource.close();
    };
  }, []);
};
