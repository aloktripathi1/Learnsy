'use server'

import { ensureUserExists } from '@/lib/ensure-user'

/**
 * Server action to ensure the current user exists in the database.
 * Call this from client components when they first load.
 */
export async function ensureUserAction() {
  try {
    const userId = await ensureUserExists()
    return { success: true, userId }
  } catch (error) {
    console.error('Error in ensureUserAction:', error)
    return { success: false, error: 'Failed to initialize user' }
  }
}
