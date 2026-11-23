let sharedAudioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    sharedAudioCtx = new AudioCtx()
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume()
  }
  return sharedAudioCtx
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime + startOffset

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.02)
}

/** Default crisp Google Material chime sound */
export function playSuccessSound(volume = 0.85): void {
  try {
    const ctx = getAudioContext()
    const v = Math.max(0.05, Math.min(1, volume)) * 0.45
    playTone(ctx, 587.33, 0.0, 0.18, v, 'sine')     // D5
    playTone(ctx, 880.0, 0.09, 0.22, v, 'sine')     // A5
    playTone(ctx, 1174.66, 0.19, 0.42, v, 'triangle') // D6
  } catch (err) {
    console.warn('Audio playback failed:', err)
  }
}
