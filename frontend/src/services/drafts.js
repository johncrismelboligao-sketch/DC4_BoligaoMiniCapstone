const DRAFT_PREFIX = 'kickoff:draft'

export function draftStorageKey(scope, userId) {
  return `${DRAFT_PREFIX}:${scope}:${userId ?? 'guest'}`
}

export function readDraft(key) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function writeDraft(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be disabled or full; the form remains usable in memory.
  }
}

export function clearDraft(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Storage may be disabled; ignore cleanup failures.
  }
}
