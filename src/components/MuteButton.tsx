import { useState } from 'react'
import { isMuted, setMuted, sfx } from '../game/sound.ts'

export default function MuteButton() {
  const [muted, setState] = useState(isMuted)
  const toggle = () => {
    setMuted(!muted)
    setState(!muted)
    if (muted) sfx.pop()
  }
  return (
    <button className="mute" onClick={toggle} aria-label={muted ? '소리 켜기' : '소리 끄기'}>
      {muted ? '🔇 소리 꺼짐' : '🔊 소리 켜짐'}
    </button>
  )
}
