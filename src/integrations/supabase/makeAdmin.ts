
import { supabase } from "./client";

/**
 * Makes a user an admin by their email address
 * @param email The email address of the user to make an admin
 */
export const makeUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // First get the user ID from Supabase by email
    const { data: users, error: authError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (authError || !users) {
      console.error("Error finding user by email:", authError);
      return false;
    }
    
    // Update the profile to set role as admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', users.id);
    
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
