import { useState, useEffect, useCallback, useRef } from 'react';
import { VisualizerStep, PlaybackStatus } from '@/types/graph';

export function useVisualizerTimeline(timeline: VisualizerStep[]) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [speed, setSpeed] = useState<number>(1.5); // speed multiplier (e.g. 1.5x)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-reset index if timeline changes using render-time synchronization
  const [prevTimeline, setPrevTimeline] = useState<VisualizerStep[]>(timeline);
  if (prevTimeline !== timeline) {
    setPrevTimeline(timeline);
    setCurrentStepIndex(0);
    setStatus('idle');
  }

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
      clearTimer();
    }
  }, [status, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setCurrentStepIndex(0);
    setStatus('idle');
  }, [clearTimer]);

  const nextStep = useCallback(() => {
    if (timeline.length === 0) return;
    setCurrentStepIndex((prev) => {
      const nextIdx = prev + 1;
      if (nextIdx >= timeline.length) {
        setStatus('completed');
        return prev;
      }
      return nextIdx;
    });
  }, [timeline]);

  const prevStep = useCallback(() => {
    if (timeline.length === 0) return;
    setStatus('paused');
    clearTimer();
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, [timeline, clearTimer]);

  const play = useCallback(() => {
    if (timeline.length === 0) return;
    
    // Instantly transition to the final step of the algorithm
    setCurrentStepIndex(timeline.length - 1);
    setStatus('completed');
  }, [timeline]);

  const setStepIndex = useCallback((idx: number) => {
    if (timeline.length === 0) return;
    const sanitized = Math.max(0, Math.min(timeline.length - 1, idx));
    setCurrentStepIndex(sanitized);
    if (sanitized === timeline.length - 1) {
      setStatus('completed');
      clearTimer();
    } else if (status === 'completed') {
      setStatus('paused');
    }
  }, [timeline, status, clearTimer]);

  // Keep player ticking smoothly
  useEffect(() => {
    if (status !== 'playing') {
      clearTimer();
      return;
    }

    clearTimer();

    // Mapping speed factor to dynamic timeout duration (ms)
    // 1.0x -> 1000ms, 1.5x -> 666ms, 2.0x -> 500ms, 3.0x -> 333ms, 0.5x -> 2000ms
    const delay = Math.round(1000 / speed);

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const nextIdx = prev + 1;
        if (nextIdx >= timeline.length) {
          setStatus('completed');
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return nextIdx;
      });
    }, delay);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, speed, timeline, clearTimer]);

  const currentStep = timeline[currentStepIndex] || null;

  return {
    currentStepIndex,
    currentStep,
    status,
    speed,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    setSpeed,
    setStepIndex,
    hasTimeline: timeline.length > 0,
    totalSteps: timeline.length,
  };
}
