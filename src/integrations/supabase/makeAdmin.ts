// This file allows making a user an admin by updating their role in the profiles table
import { supabase } from "./client";

/**
 * Makes a user with a specified Clerk ID an admin by updating their role in the profiles table
 * @param clerkUserId The Clerk user ID to make admin
 * @returns Promise<boolean> Whether the operation was successful
 */
export const makeUserAdmin = async (clerkUserId: string): Promise<boolean> => {
  try {
    // Update the profile to set role as admin
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', clerkUserId);
    
    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }
    
    console.log(`User ${clerkUserId} has been made an admin successfully`);
    return true;
  } catch (error) {
    console.error("Unexpected error making user admin:", error);
    return false;
  }
};

/**
 * Creates an admin profile for a new Clerk user if it doesn't exist
 * @param clerkUserId The Clerk user ID
 * @param fullName Optional full name
 * @param avatarUrl Optional avatar URL
 * @returns Promise<boolean> Whether the operation was successful
 */
export const createAdminProfile = async (
  clerkUserId: string, 
  fullName?: string,
  avatarUrl?: string
): Promise<boolean> => {
  try {
    // Check if the profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', clerkUserId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking for existing profile:", checkError);
      return false;
    }
    
    // If profile exists, update role to admin
    if (existingProfile) {
      return makeUserAdmin(clerkUserId);
    }
    
    // Otherwise, create a new profile with admin role
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: clerkUserId,
        full_name: fullName || '',
        avatar_url: avatarUrl || '',
        role: 'admin'
      });
    
    if (createError) {
      console.error("Error creating admin profile:", createError);
      return false;
    }
    
    console.log(`Admin profile created for user ${clerkUserId}`);
    return true;
  } catch (error) {
    console.error("Unexpected error creating admin profile:", error);
    return false;
  }
};
