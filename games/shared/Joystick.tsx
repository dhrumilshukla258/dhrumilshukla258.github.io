import React, { useCallback, useRef, useState } from 'react';
import { InputState } from '@/games/questline/engine';
import styles from './Joystick.module.css';

interface Props {
  inputRef: React.MutableRefObject<InputState>;
}

const RADIUS = 44;   // px the knob can travel from center
const DEADZONE = 0.25; // fraction of RADIUS before a direction engages

export function Joystick({ inputRef }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const clearDirs = useCallback(() => {
    inputRef.current.left = inputRef.current.right = false;
    inputRef.current.up   = inputRef.current.down  = false;
  }, [inputRef]);

  const updateFromPoint = useCallback((clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > RADIUS) { dx = (dx / dist) * RADIUS; dy = (dy / dist) * RADIUS; }
    setKnob({ x: dx, y: dy });

    const nx = dx / RADIUS, ny = dy / RADIUS;
    inputRef.current.left  = nx < -DEADZONE;
    inputRef.current.right = nx >  DEADZONE;
    inputRef.current.up    = ny < -DEADZONE;
    inputRef.current.down  = ny >  DEADZONE;
  }, [inputRef]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    activePointer.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPoint(e.clientX, e.clientY);
  }, [updateFromPoint]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (activePointer.current !== e.pointerId) return;
    updateFromPoint(e.clientX, e.clientY);
  }, [updateFromPoint]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    clearDirs();
  }, [clearDirs]);

  return (
    <div
      ref={baseRef}
      className={styles.joyBase}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={styles.joyKnob}
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
