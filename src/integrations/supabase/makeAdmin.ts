
// This file allows making a user an admin by updating their role in the profiles table
import { supabase } from "./client";

/**
 * Makes a user with a specified Clerk ID an admin by updating their role in the profiles table
 * @param clerkUserId The Clerk user ID to make admin
 * @returns Promise<boolean> Whether the operation was successful
 */
export const makeUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Update the profile to set role as admin
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }
    
    console.log(`User ${userId} has been made an admin successfully`);
    return true;
  } catch (error) {
    console.error("Unexpected error making user admin:", error);
    return false;
  }
};

/**
 * Creates an admin profile for a new user if it doesn't exist
 * @param userId The user ID
 * @param fullName Optional full name
 * @param avatarUrl Optional avatar URL
 * @param email User's email (required for profile creation)
 * @returns Promise<boolean> Whether the operation was successful
 */
export const createAdminProfile = async (
  userId: string, 
  fullName?: string,
  avatarUrl?: string,
  email?: string
): Promise<boolean> => {
  try {
    // Check if the profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking for existing profile:", checkError);
      return false;
    }
    
    // If profile exists, update role to admin
    if (existingProfile) {
      return makeUserAdmin(userId);
    }
    
    // Email is required for profile creation
    if (!email) {
      console.error("Email is required for profile creation");
      return false;
    }
    
    // Otherwise, create a new profile with admin role
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || '',
        avatar_url: avatarUrl || '',
        role: 'admin'
      });
    
    if (createError) {
      console.error("Error creating admin profile:", createError);
      return false;
    }
    
    console.log(`Admin profile created for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Unexpected error creating admin profile:", error);
    return false;
  }
};

/**
 * Checks if a user already exists with admin role
 * @param email The email to check
 * @returns Promise<boolean> Whether the user exists and is an admin
 */
export const checkAdminExists = async (email: string): Promise<boolean> => {
  try {
    // First check if a profile with this email exists
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking if admin exists:", error);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (error) {
    console.error("Unexpected error checking admin:", error);
    return false;
  }
};

/**
 * Ensures the default admin user exists in the database
 * This should be called during application initialization
 */
export const ensureDefaultAdmin = async (): Promise<void> => {
  const defaultAdminEmail = 'ianmiriti254@gmail.com';
  
  try {
    // Check if the admin already exists
    const isAdmin = await checkAdminExists(defaultAdminEmail);
    
    if (isAdmin) {
      console.log("Default admin already exists");
      return;
    }
    
    // Check if a user with this email exists
    const { data: authUser } = await supabase.auth.admin.getUserByEmail(defaultAdminEmail);
    
    if (authUser?.user) {
      // User exists, make them admin
      await makeUserAdmin(authUser.user.id);
    } else {
      console.log("Default admin user does not exist in auth system");
      // We can't create auth users from client side - this would need to be done via a Supabase Edge Function
    }
  } catch (error) {
    console.error("Error ensuring default admin exists:", error);
  }
};
