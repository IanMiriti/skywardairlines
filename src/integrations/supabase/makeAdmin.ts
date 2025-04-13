
import { supabase } from "./client";

/**
 * Makes a user an admin by their email address
 * @param email The email address of the user to make an admin
 */
export const makeUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // First, get the auth user ID from Supabase Auth by email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (authError || !authUser) {
      console.error("Error finding user by email:", authError);
      return false;
    }
    
    // Update the profile to set role as admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authUser.id);
    
    if (updateError) {
      console.error("Error updating user role:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error making user admin:", error);
    return false;
  }
};
