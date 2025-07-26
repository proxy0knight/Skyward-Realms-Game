import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('base-class', 'additional-class')).toBe('base-class additional-class')
    })

    it('handles conditional classes', () => {
      const showConditional = true
      const hideClass = false
      expect(cn('base-class', showConditional && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', hideClass && 'hidden-class')).toBe('base-class')
    })

    it('merges tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('handles empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
    })
  })
})
