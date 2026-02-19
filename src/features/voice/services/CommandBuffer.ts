type ProcessCallback = (text: string, isFinal: boolean) => void;

export class CommandBuffer {
  private debounceMs: number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingText = '';
  private onProcess: ProcessCallback;
  
  private lastProcessedText = '';
  private lastProcessedTime = 0;
  private readonly COOLDOWN_MS = 800;

  constructor(onProcess: ProcessCallback, debounceMs = 400) {
    this.onProcess = onProcess;
    this.debounceMs = debounceMs;
  }

  public push(text: string, isFinal: boolean): void {
    const normalizedText = text.toLowerCase().trim();
    
    if (normalizedText === this.lastProcessedText) {
      const timeSinceLastProcess = Date.now() - this.lastProcessedTime;
      if (timeSinceLastProcess < this.COOLDOWN_MS) {
        return;
      }
    }

    this.pendingText = text;

    if (isFinal) {
      this.flush(true);
      return;
    }

    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(false), this.debounceMs);
  }

  private flush(isFinal: boolean): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const text = this.pendingText.trim();
    if (text.length === 0) return;

    const normalizedText = text.toLowerCase().trim();
    
    if (normalizedText === this.lastProcessedText) {
      const timeSinceLastProcess = Date.now() - this.lastProcessedTime;
      if (timeSinceLastProcess < this.COOLDOWN_MS) {
        this.pendingText = '';
        return;
      }
    }

    this.lastProcessedText = normalizedText;
    this.lastProcessedTime = Date.now();
    
    this.onProcess(text, isFinal);
    this.pendingText = '';
  }

  public cancel(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pendingText = '';
    this.lastProcessedText = '';
    this.lastProcessedTime = 0;
  }

  public resetCooldown(): void {
    this.lastProcessedText = '';
    this.lastProcessedTime = 0;
  }
}
