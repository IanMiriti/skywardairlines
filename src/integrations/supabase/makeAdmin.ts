// This file allows making a user an admin by updating their role in the profiles table
import { supabase } from "./client";

/**
 * Makes a user with a specified ID an admin by updating their role in the profiles table
 * @param userId The user ID to make admin
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
  try {
    // Instead of trying to access auth.admin.getUserByEmail which doesn't exist,
    // we'll look for the profile in the profiles table directly
    const adminEmail = process.env.ADMIN_EMAIL || '';
    
    if (!adminEmail) {
      console.log("No default admin email configured");
      return;
    }
    
    // Check if an admin with this email already exists
    const isAdmin = await checkAdminExists(adminEmail);
    
    if (isAdmin) {
      console.log("Default admin already exists");
      return;
    }
    
    // If the admin doesn't exist, we can't create them automatically
    // from the client side without their auth ID
    console.log("Default admin user does not exist in profiles table");
    console.log("Please create an admin user manually or through the authentication process");
    
  } catch (error) {
    console.error("Error ensuring default admin exists:", error);
  }
};
