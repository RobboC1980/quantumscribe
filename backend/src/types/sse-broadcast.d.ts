declare module 'sse-broadcast' {
  import { Request, Response } from 'express';
  
  export class Broadcast {
    subscribe(req: Request, res: Response): void;
    publish(data: string): void;
  }
} 