import { useRef } from 'react';
import { GlitchEffect }    from './glitch';
import { TeamBuildEffect } from './team-build';
import { SSHEffect }       from './ssh';

export function TechnicalEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const pick = useRef(Math.floor(Math.random() * 3)).current;
  if (pick === 0) return <GlitchEffect    onMid={onMid} onDone={onDone} />;
  if (pick === 1) return <TeamBuildEffect onMid={onMid} onDone={onDone} />;
  return                  <SSHEffect      onMid={onMid} onDone={onDone} />;
}
