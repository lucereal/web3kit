// lib/events/handlers/base-event-handler.ts
import { RepositoryFactory } from '../../db/supabase';

export abstract class BaseEventHandler<T = any> {
  protected repositories: RepositoryFactory;

  constructor() {
    this.repositories = RepositoryFactory.getInstance();
  }

  abstract handle(event: T): Promise<void>;

  protected async logEvent(eventType: string, data: any): Promise<void> {
    console.log(`Processing ${eventType}:`, data);
    // Could also store in database for audit trail
  }
}