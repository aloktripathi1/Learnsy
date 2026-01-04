import { auth, currentUser } from '@clerk/nextjs/server'
import { DatabaseService } from './database'

/**
 * Ensures the authenticated user exists in the database.
 * Call this function at the start of any server component or API route
 * that needs to interact with the database using the user's ID.
 * 
 * @returns The user ID if authenticated, null otherwise
 */
export async function ensureUserExists(): Promise<string | null> {
  const { userId } = auth()
  
  if (!userId) {
    return null
  }

  try {
    // Get full user details from Clerk
    const clerkUser = await currentUser()
    
    if (clerkUser) {
      // Upsert user to database (creates if doesn't exist, updates if exists)
      await DatabaseService.upsertUser({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || undefined,
        image_url: clerkUser.imageUrl || undefined,
      })
    }
    
    return userId
  } catch (error) {
    console.error('Error ensuring user exists:', error)
    // Don't throw - return userId anyway as it might be a temporary DB issue
    return userId
  }
}
