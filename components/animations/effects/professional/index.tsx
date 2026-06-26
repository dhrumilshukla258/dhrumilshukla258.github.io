import { useRef } from 'react';
import { BoardroomEffect }  from './boardroom';
import { NewspaperEffect }  from './newspaper';
import { TypewriterEffect } from './typewriter';

export function ProfessionalEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const pick = useRef(Math.floor(Math.random() * 3)).current;
  if (pick === 0) return <BoardroomEffect  onMid={onMid} onDone={onDone} />;
  if (pick === 1) return <NewspaperEffect  onMid={onMid} onDone={onDone} />;
  return                  <TypewriterEffect onMid={onMid} onDone={onDone} />;
}
