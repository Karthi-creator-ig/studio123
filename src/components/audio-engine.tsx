'use client';

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export function useAudioEngine() {
  const [audioStarted, setAudioStarted] = useState(false);
  const synth = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    // Initialize synth on mount but don't start audio context
    if (!synth.current) {
      synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    }
    
    const checkState = () => {
      try {
        setAudioStarted(Tone.getContext().state === 'running');
      } catch (e) {
        setAudioStarted(false);
      }
    };
    
    checkState();
    // Periodically check if context was suspended by browser
    const interval = setInterval(checkState, 2000);
    return () => clearInterval(interval);
  }, []);

  const playAlert = async (type: string = 'iris') => {
    try {
      // Browsers block audio until a user gesture. 
      // Tone.start() MUST be called in response to a user action (like a click).
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
        await Tone.getContext().resume();
        setAudioStarted(true);
      }

      if (!synth.current) {
        synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
      }

      const now = Tone.now();

      // Special case for 'test' - used for the Sync Audio button
      if (type === 'test') {
        synth.current.triggerAttackRelease("G4", "8n", now);
        return;
      }

      // Alarm sequence duration: 10 seconds
      const totalDuration = 10; 

      if (type === 'iris') {
        const interval = 1.0; 
        for (let i = 0; i < totalDuration; i += interval) {
          synth.current.triggerAttackRelease(["C4", "E4", "G4"], "8n", now + i);
          synth.current.triggerAttackRelease(["G4", "B4", "D5"], "8n", now + i + 0.33);
          synth.current.triggerAttackRelease(["E4", "G4", "C5"], "8n", now + i + 0.66);
        }
      } else if (type === 'sky') {
        const interval = 2.0; 
        for (let i = 0; i < totalDuration; i += interval) {
          synth.current.triggerAttackRelease(["A4", "C#5", "E5"], "2n", now + i);
          synth.current.triggerAttackRelease(["D5", "F#5", "A5"], "2n", now + i + 1.0);
        }
      } else if (type === 'pulse') {
        const interval = 2.5;
        for (let i = 0; i < totalDuration; i += interval) {
          synth.current.triggerAttackRelease("C2", "1n", now + i);
          synth.current.triggerAttackRelease("G2", "1n", now + i + 1.25);
        }
      } else {
        synth.current.triggerAttackRelease("G4", "8n", now);
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  return { playAlert, audioStarted };
}
