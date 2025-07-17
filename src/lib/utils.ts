import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function playSound(type: 'move' | 'complete' | 'start') {
  // Create audio context for sound effects
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  
  const frequencies = {
    move: 800,
    complete: 1200,
    start: 600
  }
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime)
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.2)
}

export function createConfetti() {
  const colors = ['#00C853', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B']
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.left = Math.random() * 100 + 'vw'
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.animationDelay = Math.random() * 3 + 's'
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'
    
    document.body.appendChild(confetti)
    
    setTimeout(() => {
      confetti.remove()
    }, 5000)
  }
}