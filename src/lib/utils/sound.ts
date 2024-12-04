class SoundEffect {
  private audio: HTMLAudioElement | null = null;
  private isLoaded = false;

  constructor(private url: string) {
    if (typeof window !== 'undefined') {
      this.audio = new Audio(url);
      this.audio.addEventListener('canplaythrough', () => {
        this.isLoaded = true;
      });
    }
  }

  play() {
    if (this.audio && this.isLoaded) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {
        // Ignore autoplay restrictions
      });
    }
  }
}

export const pageTurnSound = new SoundEffect('/sounds/page-turn.mp3');
export const bookOpenSound = new SoundEffect('/sounds/book-open.mp3');
export const bookCloseSound = new SoundEffect('/sounds/book-close.mp3'); 