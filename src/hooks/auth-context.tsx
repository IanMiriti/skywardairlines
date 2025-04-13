
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean | null;
  isAdminLoading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    // Set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // If user logs in or out, check admin status
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkUserAdmin(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(null);
          setIsAdminLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserAdmin(session.user);
      } else {
        setIsAdminLoading(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user is admin
  const checkUserAdmin = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setIsAdminLoading(false);
      return;
    }

    setIsAdminLoading(true);

    try {
      try {
        // Try using the is_admin RPC function first
        const { data: isAdminResult, error: rpcError } = await supabase.rpc('is_admin');
        
        if (!rpcError) {
          console.log("Admin check via RPC:", isAdminResult);
          setIsAdmin(isAdminResult === true);
          setIsAdminLoading(false);
          return;
        }
      } catch (rpcError) {
        console.error("Error checking admin via RPC:", rpcError);
        // Continue with fallback method
      }

      // Fallback: Check database for admin role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        toast({
          title: "Error",
          description: "Couldn't verify admin status. Please try again.",
          variant: "destructive"
        });
      } else if (!data) {
        console.log("No profile found for user", user.id);
        setIsAdmin(false);
        
        // Create a profile for the user if it doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            role: 'customer'
          });
          
        if (createError) {
          console.error("Error creating profile:", createError);
        }
      } else {
        console.log("User role:", data.role);
        setIsAdmin(data.role === 'admin');
        
        if (data.role === 'admin') {
          toast({
            title: "Admin Access",
            description: "You have admin privileges.",
          });
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.refreshSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        await checkUserAdmin(data.session.user);
      }
      return data;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    
    if (!response.error && response.data.user) {
      // Directly check if user is admin
      try {
        const { data: isAdminResult, error: rpcError } = await supabase.rpc('is_admin');
        
        if (!rpcError && isAdminResult === true) {
          setIsAdmin(true);
        } else {
          // Fallback to database check
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', response.data.user.id)
            .maybeSingle();
            
          if (!error && data?.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error("Error checking admin status during signin:", error);
      }
    }
    
    return response;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    // Profile creation is handled by database trigger
    
    return response;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(null);
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isAdminLoading,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
