
import { supabase } from "./client";

/**
 * Makes a user an admin by their email address
 * @param email The email address of the user to make an admin
 */
export const makeUserAdmin = async (email: string): Promise<boolean> => {
  try {
    // First query the profiles table to find a user with the given email
    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .limit(1);
    
    if (queryError || !profiles || profiles.length === 0) {
      console.error("Error finding user by email:", queryError);
      return false;
    }
    
    const userId = profiles[0].id;
    
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
