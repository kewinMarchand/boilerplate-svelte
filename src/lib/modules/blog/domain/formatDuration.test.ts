import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('donne les secondes sous une minute', () => {
    expect(formatDuration(4)).toBe('4 s')
  })

  it('arrondit à la minute', () => {
    expect(formatDuration(60)).toBe('1 min')
    expect(formatDuration(26 * 60 + 29)).toBe('26 min')
    expect(formatDuration(26 * 60 + 30)).toBe('27 min')
  })

  it('compte les heures au-delà de soixante minutes', () => {
    expect(formatDuration(65 * 60)).toBe('1 h 05 min')
  })
})
