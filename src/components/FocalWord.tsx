import React from 'react'
import type { RsvpWord } from '../engine/types'
import { calculateORP } from '../engine/orp'
import './FocalWord.css'

interface FocalWordProps {
  word: RsvpWord | null
}

const FocalWord: React.FC<FocalWordProps> = ({ word }) => {
  if (!word) {
    return (
      <div className="focal-word-container">
        <div className="focal-guide-line focal-guide-line--top" />
        <div className="focal-word">
          <span className="focal-ready">Ready</span>
        </div>
        <div className="focal-guide-line focal-guide-line--bottom" />
      </div>
    )
  }

  const orpIndex = calculateORP(word.text)
  const before = word.text.substring(0, orpIndex)
  const orpChar = word.text.charAt(orpIndex)
  const after = word.text.substring(orpIndex + 1)

  return (
    <div className="focal-word-container">
      <div className="focal-guide-line focal-guide-line--top" />
      <div className="focal-word focal-word--animate">
        <span className="focal-part focal-part--dim">{before}</span>
        <span className="focal-part focal-part--orp">{orpChar}</span>
        <span className="focal-part focal-part--dim">{after}</span>
      </div>
      <div className="focal-guide-line focal-guide-line--bottom" />
    </div>
  )
}

export default FocalWord
