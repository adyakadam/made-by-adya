import { describe, test, expect } from 'vitest'
import { mergeContent, DEFAULT_CONTENT } from '@/lib/content'

describe('mergeContent', () => {
  test('returns DEFAULT_CONTENT when called with null', () => {
    expect(mergeContent(null)).toEqual(DEFAULT_CONTENT)
  })

  test('returns DEFAULT_CONTENT when called with undefined', () => {
    expect(mergeContent(undefined)).toEqual(DEFAULT_CONTENT)
  })

  test('returns DEFAULT_CONTENT when called with a non-object', () => {
    expect(mergeContent('string')).toEqual(DEFAULT_CONTENT)
    expect(mergeContent(42)).toEqual(DEFAULT_CONTENT)
    expect(mergeContent(true)).toEqual(DEFAULT_CONTENT)
  })

  test('overrides fields that are present in stored object', () => {
    const result = mergeContent({ hero_title: 'Custom Title' })
    expect(result.hero_title).toBe('Custom Title')
  })

  test('keeps defaults for fields not in stored object', () => {
    const result = mergeContent({ hero_title: 'Custom Title' })
    expect(result.hero_eyebrow).toBe(DEFAULT_CONTENT.hero_eyebrow)
    expect(result.announce_bar).toBe(DEFAULT_CONTENT.announce_bar)
  })

  test('merges multiple fields at once', () => {
    const stored = { hero_title: 'New Title', footer_email: 'new@email.com' }
    const result = mergeContent(stored)
    expect(result.hero_title).toBe('New Title')
    expect(result.footer_email).toBe('new@email.com')
    expect(result.hero_desc).toBe(DEFAULT_CONTENT.hero_desc)
  })

  test('handles empty object — all defaults', () => {
    const result = mergeContent({})
    expect(result).toEqual(DEFAULT_CONTENT)
  })

  test('DEFAULT_CONTENT has expected key fields', () => {
    expect(DEFAULT_CONTENT.pillars).toHaveLength(4)
    expect(DEFAULT_CONTENT.faq_items.length).toBeGreaterThan(0)
    expect(DEFAULT_CONTENT.custom_list.length).toBeGreaterThan(0)
    expect(DEFAULT_CONTENT.about_steps.length).toBeGreaterThan(0)
  })
})
