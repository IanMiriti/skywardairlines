
import { supabase } from "./client";

/**
 * Makes a user an admin by their email address
 * @param email The email address of the user to make an admin
 */
export const makeUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // First query the profiles table to find a user with the given email
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .filter('email', 'eq', email)
      .limit(1);
    
    if (error || !data || data.length === 0) {
      console.error("Error finding user by email:", error);
      return false;
    }
    
    const userId = data[0].id;
    
    // Update the profile to set role as admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error updating user role:", updateError);
      return false;
    }
    
    console.log(`Successfully made user ${email} an admin`);
    return true;
  } catch (error) {
    console.error("Error making user admin:", error);
    return false;
  }
};
