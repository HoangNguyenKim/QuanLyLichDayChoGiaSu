import { Request, Response } from 'express';

class SseController {
  private clients: Response[] = [];

  /**
   * GET /api/notifications/stream
   * Endpoint for SSE connection.
   */
  public stream = (req: Request, res: Response) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Flush headers
    res.flushHeaders();

    // Add client to array
    this.clients.push(res);

    // Send an initial connected message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notifications' })}\n\n`);

    // Remove client when connection closes
    req.on('close', () => {
      this.clients = this.clients.filter((client) => client !== res);
    });
  };

  /**
   * Broadcast a message to all connected SSE clients.
   * @param eventName Name of the event
   * @param data The data payload to send
   */
  public broadcast(eventName: string, data: any) {
    const payload = {
      type: eventName,
      data
    };
    const message = `data: ${JSON.stringify(payload)}\n\n`;
    this.clients.forEach((client) => {
      client.write(message);
    });
  }
}

export const sseController = new SseController();
