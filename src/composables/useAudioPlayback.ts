import { ref, computed, onUnmounted, readonly } from 'vue'
import { createAudioUrlWithAuth } from '../utils/audio'

export interface AudioPlaybackOptions {
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlaybackEnd?: () => void
  onError?: (error: Error) => void
}

export function useAudioPlayback(options: AudioPlaybackOptions = {}) {
  // === State ===
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  // Web Audio API refs
  const audioContext = ref<AudioContext | null>(null)
  const audioBuffer = ref<AudioBuffer | null>(null)
  const sourceNode = ref<AudioBufferSourceNode | null>(null)
  const audioStartTime = ref(0) // AudioContext time when playback started
  const audioOffset = ref(0) // Offset within the audio buffer (for pause/resume)
  const animationFrameId = ref<number | null>(null)

  // Segment bounds for current playback
  const segmentStart = ref(0)
  const segmentEnd = ref(0)

  // Flag to distinguish manual stop from natural playback end
  const manualStop = ref(false)

  // === Computed ===
  const progressPercentage = computed(() => {
    if (duration.value <= 0) return 0
    return Math.min(100, (currentTime.value / duration.value) * 100)
  })

  // === Web Audio API Methods ===

  /**
   * Initialize AudioContext (lazy initialization)
   */
  const getAudioContext = (): AudioContext => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }
    return audioContext.value
  }

  /**
   * Load audio file into AudioBuffer
   */
  const loadAudio = async (url: string): Promise<AudioBuffer> => {
    const ctx = getAudioContext()
    const authUrl = createAudioUrlWithAuth(url)

    const response = await fetch(authUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = await ctx.decodeAudioData(arrayBuffer)
    audioBuffer.value = buffer
    return buffer
  }

  /**
   * Stop current audio source node
   */
  const stopSourceNode = (isManualStop = true) => {
    if (sourceNode.value) {
      // Set flag before stopping to distinguish from natural end
      if (isManualStop) {
        manualStop.value = true
      }
      try {
        sourceNode.value.stop()
        sourceNode.value.disconnect()
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNode.value = null
    }
  }

  /**
   * Cancel animation frame for time updates
   */
  const cancelTimeUpdate = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  /**
   * Start requestAnimationFrame loop for updating currentTime (60 FPS)
   */
  const startTimeUpdateLoop = () => {
    cancelTimeUpdate()

    const ctx = getAudioContext()
    const verseDuration = duration.value
    const verseBegin = segmentStart.value

    const updateTime = () => {
      if (!sourceNode.value || !isPlaying.value) {
        animationFrameId.value = null
        return
      }

      // Calculate current position within the segment
      const elapsed = ctx.currentTime - audioStartTime.value
      const currentPosition = audioOffset.value - verseBegin + elapsed
      currentTime.value = Math.max(0, Math.min(currentPosition, verseDuration))

      // Callback
      if (options.onTimeUpdate) {
        options.onTimeUpdate(currentTime.value, duration.value)
      }

      // Schedule next update
      animationFrameId.value = requestAnimationFrame(updateTime)
    }

    animationFrameId.value = requestAnimationFrame(updateTime)
  }

  /**
   * Play audio segment with precise timing using Web Audio API
   */
  const playSegment = (
    buffer: AudioBuffer,
    startTime: number,
    endTime: number,
    onEnded?: () => void
  ): AudioBufferSourceNode => {
    const ctx = getAudioContext()

    // Stop any existing source (manual stop, don't trigger onPlaybackEnd)
    stopSourceNode(true)

    // Reset manual stop flag for new playback
    manualStop.value = false

    // Store segment bounds
    segmentStart.value = startTime
    segmentEnd.value = endTime
    duration.value = endTime - startTime

    // Create new source node
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)

    // Calculate duration
    const segmentDuration = endTime - startTime

    // Set up onended callback - fires EXACTLY when playback ends
    source.onended = () => {
      isPlaying.value = false
      cancelTimeUpdate()

      // Only call callbacks if this was a natural end, not a manual stop
      if (!manualStop.value) {
        if (onEnded) {
          onEnded()
        }
        if (options.onPlaybackEnd) {
          options.onPlaybackEnd()
        }
      }
      // Reset the flag
      manualStop.value = false
    }

    // Start playback: start(when, offset, duration)
    source.start(0, startTime, segmentDuration)

    // Store reference and timing info
    sourceNode.value = source
    audioStartTime.value = ctx.currentTime
    audioOffset.value = startTime
    isPlaying.value = true
    currentTime.value = 0

    // Start time update loop
    startTimeUpdateLoop()

    return source
  }

  /**
   * Pause playback (stores current position for resume)
   */
  const pause = () => {
    if (!isPlaying.value || !sourceNode.value) return

    // Calculate and store current position
    const ctx = getAudioContext()
    const elapsed = ctx.currentTime - audioStartTime.value
    audioOffset.value = audioOffset.value + elapsed

    // Stop the source
    stopSourceNode()
    cancelTimeUpdate()
    isPlaying.value = false
  }

  /**
   * Resume playback from stored position
   */
  const resume = () => {
    if (isPlaying.value || !audioBuffer.value) return

    const buffer = audioBuffer.value
    const ctx = getAudioContext()

    // Create new source node
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)

    // Calculate remaining duration
    const remainingDuration = segmentEnd.value - audioOffset.value

    if (remainingDuration <= 0) {
      // Already at the end, restart from beginning
      audioOffset.value = segmentStart.value
      playSegment(buffer, segmentStart.value, segmentEnd.value)
      return
    }

    // Set up onended callback
    source.onended = () => {
      isPlaying.value = false
      cancelTimeUpdate()
      if (options.onPlaybackEnd) {
        options.onPlaybackEnd()
      }
    }

    // Start from stored offset
    source.start(0, audioOffset.value, remainingDuration)

    sourceNode.value = source
    audioStartTime.value = ctx.currentTime
    isPlaying.value = true

    startTimeUpdateLoop()
  }

  /**
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    if (isPlaying.value) {
      pause()
    } else {
      resume()
    }
  }

  /**
   * Stop playback completely
   */
  const stop = () => {
    stopSourceNode()
    cancelTimeUpdate()
    isPlaying.value = false
    currentTime.value = 0
    audioOffset.value = segmentStart.value
  }

  /**
   * Seek to position (in seconds relative to segment start)
   */
  const seekTo = (position: number) => {
    if (!audioBuffer.value) return

    const buffer = audioBuffer.value
    const newOffset = segmentStart.value + Math.max(0, Math.min(position, duration.value))

    // Update current time display
    currentTime.value = Math.max(0, Math.min(position, duration.value))
    audioOffset.value = newOffset

    // If playing, restart from new position
    if (isPlaying.value) {
      stopSourceNode()

      const ctx = getAudioContext()
      const remainingDuration = segmentEnd.value - newOffset

      if (remainingDuration <= 0) return

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)

      source.onended = () => {
        isPlaying.value = false
        cancelTimeUpdate()
        if (options.onPlaybackEnd) {
          options.onPlaybackEnd()
        }
      }

      source.start(0, newOffset, remainingDuration)
      sourceNode.value = source
      audioStartTime.value = ctx.currentTime

      startTimeUpdateLoop()
    }
  }

  /**
   * Handle click on progress bar
   */
  const handleProgressClick = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const newPosition = duration.value * percentage
    seekTo(newPosition)
  }

  /**
   * Get current playback position in absolute time (within audio file)
   */
  const getCurrentAbsolutePosition = (): number => {
    if (!audioContext.value || !sourceNode.value) {
      return audioOffset.value
    }
    const elapsed = audioContext.value.currentTime - audioStartTime.value
    return audioOffset.value + elapsed
  }

  // === Format utilities ===

  /**
   * Format seconds to MM:SS.ms
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const wholeSecs = Math.floor(seconds % 60)
    const fractionalPart = Math.round((seconds % 1) * 100)
    return `${mins}:${wholeSecs.toString().padStart(2, '0')}.${fractionalPart.toString().padStart(2, '0')}`
  }

  /**
   * Format seconds to MM:SS.mmm (with milliseconds)
   */
  const formatTimeWithMs = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.round((seconds % 1) * 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  /**
   * Format time with fraction split
   */
  const formatTimeWithFraction = (seconds: number): { mainPart: string; fractionPart: string } => {
    const mins = Math.floor(seconds / 60)
    const wholeSecs = Math.floor(seconds % 60)
    const fractionalPart = Math.round((seconds % 1) * 100)
    const mainPart = `${mins}:${wholeSecs.toString().padStart(2, '0')}`
    const fractionPart = `.${fractionalPart.toString().padStart(2, '0')}`
    return { mainPart, fractionPart }
  }

  // === Cleanup ===

  const cleanup = () => {
    stop()
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    audioBuffer.value = null
  }

  onUnmounted(cleanup)

  // === Return ===

  return {
    // State (readonly where appropriate)
    isPlaying: readonly(isPlaying),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    progressPercentage,
    audioBuffer: readonly(audioBuffer),

    // Internal state (for advanced usage like Quick Check)
    _audioContext: audioContext,
    _sourceNode: sourceNode,
    _audioStartTime: audioStartTime,
    _audioOffset: audioOffset,
    _segmentStart: segmentStart,
    _segmentEnd: segmentEnd,

    // Methods
    getAudioContext,
    loadAudio,
    playSegment,
    pause,
    resume,
    togglePlayPause,
    stop,
    seekTo,
    handleProgressClick,
    getCurrentAbsolutePosition,

    // Format utilities
    formatTime,
    formatTimeWithMs,
    formatTimeWithFraction,

    // Cleanup
    cleanup
  }
}
