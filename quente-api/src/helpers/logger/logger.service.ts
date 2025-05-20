import { singleton } from 'tsyringe';

@singleton()
export class Logger {
  public info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  public error(message: string): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  }

  public warn(message: string): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }

  public debug(message: string): void {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
  }
}
