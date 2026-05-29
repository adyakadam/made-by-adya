import { describe, test, expect, vi, beforeEach } from 'vitest'
import { escapeCell, downloadCSV } from '@/lib/csv'

// ── escapeCell ─────────────────────────────────────────────────────────────
describe('escapeCell', () => {
  test('returns plain string unchanged', () => {
    expect(escapeCell('hello')).toBe('hello')
  })

  test('wraps value with comma in double quotes', () => {
    expect(escapeCell('hello, world')).toBe('"hello, world"')
  })

  test('wraps value with double-quote and escapes it', () => {
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""')
  })

  test('converts null to empty string', () => {
    expect(escapeCell(null)).toBe('')
  })

  test('converts undefined to empty string', () => {
    expect(escapeCell(undefined)).toBe('')
  })

  test('converts numbers to string', () => {
    expect(escapeCell(42)).toBe('42')
    expect(escapeCell(0)).toBe('0')
  })

  test('replaces newlines with space', () => {
    const result = escapeCell('line1\nline2')
    expect(result).not.toContain('\n')
  })

  test('replaces CRLF with space', () => {
    const result = escapeCell('line1\r\nline2')
    expect(result).not.toContain('\r')
  })
})

// ── downloadCSV ────────────────────────────────────────────────────────────
describe('downloadCSV', () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    clickSpy = vi.fn()
    const fakeAnchor = { href: '', download: '', style: { display: '' }, click: clickSpy } as unknown as HTMLAnchorElement
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(fakeAnchor)
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(fakeAnchor)
    vi.spyOn(document, 'createElement').mockReturnValue(fakeAnchor)
  })

  test('does nothing when rows array is empty', () => {
    downloadCSV([], 'test.csv')
    expect(clickSpy).not.toHaveBeenCalled()
  })

  test('triggers a download click', () => {
    downloadCSV([{ name: 'Alice', amount: 100 }], 'export.csv')
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  test('appends and then removes anchor from body', () => {
    downloadCSV([{ name: 'Alice' }], 'test.csv')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
  })

  test('creates object URL and revokes it', () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    downloadCSV([{ a: 1 }], 'test.csv')
    expect(createSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()
  })
})
