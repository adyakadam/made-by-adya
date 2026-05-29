import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock only createObjectURL / revokeObjectURL — keep URL as a constructor
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn()
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// Mock navigator.clipboard
Object.defineProperty(globalThis, 'navigator', {
  value: { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } },
  writable: true,
})
