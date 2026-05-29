import { describe, test, expect, beforeEach } from 'vitest'
import { useWishlist } from '@/lib/wishlist-store'

function get() { return useWishlist.getState() }
function reset() { useWishlist.setState({ ids: [] }) }

beforeEach(reset)

describe('toggle', () => {
  test('adds id when not in wishlist', () => {
    get().toggle('p1')
    expect(useWishlist.getState().ids).toContain('p1')
  })

  test('removes id when already in wishlist', () => {
    get().toggle('p1')
    get().toggle('p1')
    expect(useWishlist.getState().ids).not.toContain('p1')
  })

  test('toggling one id does not affect others', () => {
    get().toggle('p1')
    get().toggle('p2')
    get().toggle('p1')
    const { ids } = useWishlist.getState()
    expect(ids).not.toContain('p1')
    expect(ids).toContain('p2')
  })
})

describe('has', () => {
  test('returns true when id is in wishlist', () => {
    get().toggle('p1')
    expect(get().has('p1')).toBe(true)
  })

  test('returns false when id is not in wishlist', () => {
    expect(get().has('p99')).toBe(false)
  })
})

describe('count', () => {
  test('returns 0 for empty wishlist', () => {
    expect(get().count()).toBe(0)
  })

  test('returns correct count after multiple toggles', () => {
    get().toggle('p1')
    get().toggle('p2')
    get().toggle('p3')
    expect(get().count()).toBe(3)
  })

  test('decrements when item is toggled off', () => {
    get().toggle('p1')
    get().toggle('p2')
    get().toggle('p1') // remove
    expect(get().count()).toBe(1)
  })
})
