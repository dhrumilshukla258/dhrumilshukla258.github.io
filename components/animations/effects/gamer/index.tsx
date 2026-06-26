import { useRef } from 'react';
import { OvercookedEffect } from './overcooking';
import { BasketballEffect } from './basketball';
import { PlatformerEffect } from './platformer';

export function GamerEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const pick = useRef(Math.floor(Math.random() * 3)).current;
  if (pick === 0) return <OvercookedEffect  onMid={onMid} onDone={onDone} />;
  if (pick === 1) return <BasketballEffect  onMid={onMid} onDone={onDone} />;
  return                  <PlatformerEffect onMid={onMid} onDone={onDone} />;
}
