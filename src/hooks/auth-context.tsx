
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  // Special admin email constant
  const ADMIN_EMAIL = 'ianmiriti254@gmail.com';

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

    // Quick admin check by email
    if (user.email === ADMIN_EMAIL) {
      console.log("Admin email detected");
      setIsAdmin(true);
      setIsAdminLoading(false);
      
      // Ensure admin status in database
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking profile:", error);
        } else if (!profile) {
          console.log("Creating admin profile");
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              role: 'admin'
            });
        } else if (profile.role !== 'admin') {
          console.log("Updating to admin role");
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error("Database operation failed:", error);
      }
      
      return;
    }

    // Database admin check
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    
    if (data.session?.user) {
      checkUserAdmin(data.session.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
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
