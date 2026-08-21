import { describe, it, expect } from 'vitest'
import { formatTimeRemaining } from './time'

describe('formatTimeRemaining', () => {
  it('returns "0s" for 0', () => {
    expect(formatTimeRemaining(0)).toBe('0s')
  })

  it('returns "0s" for negative', () => {
    expect(formatTimeRemaining(-5)).toBe('0s')
  })

  it('returns "0s" for NaN', () => {
    expect(formatTimeRemaining(NaN)).toBe('0s')
  })

  it('returns "0s" for Infinity', () => {
    expect(formatTimeRemaining(Infinity)).toBe('0s')
  })

  it('formats seconds only', () => {
    expect(formatTimeRemaining(45)).toBe('45s')
    expect(formatTimeRemaining(1)).toBe('1s')
    expect(formatTimeRemaining(59)).toBe('59s')
  })

  it('formats minutes and seconds', () => {
    expect(formatTimeRemaining(90)).toBe('1m 30s')
    expect(formatTimeRemaining(150)).toBe('2m 30s')
    expect(formatTimeRemaining(60)).toBe('1m 00s')
  })

  it('formats hours and minutes', () => {
    expect(formatTimeRemaining(3600)).toBe('1h 00m')
    expect(formatTimeRemaining(3660)).toBe('1h 01m')
    expect(formatTimeRemaining(5400)).toBe('1h 30m')
  })

  it('truncates fractional seconds', () => {
    expect(formatTimeRemaining(45.9)).toBe('45s')
  })
})
