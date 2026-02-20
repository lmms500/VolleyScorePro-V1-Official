type ProcessCallback = (text: string, isFinal: boolean) => void;

export class CommandBuffer {
  private debounceMs: number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingText = '';
  private onProcess: ProcessCallback;

  constructor(onProcess: ProcessCallback, debounceMs = 400) {
    this.onProcess = onProcess;
    this.debounceMs = debounceMs;
  }

  public push(text: string, isFinal: boolean): void {
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

    this.onProcess(text, isFinal);
    this.pendingText = '';
  }

  public cancel(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pendingText = '';
  }
}
