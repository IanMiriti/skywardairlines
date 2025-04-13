import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Save,
  ShieldCheck,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, loading: authLoading, refreshSession } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        setProfileData(data || {});
        
        // Set form data from profile and user
        setFormData({
          fullName: user.user_metadata?.full_name || data?.full_name || "",
          email: user.email || "",
          phone: data?.phone_number || "",
          dateOfBirth: data?.date_of_birth ? data.date_of_birth : "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && user) {
      fetchProfile();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Update user metadata
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone
        }
      });
      
      if (userUpdateError) {
        throw userUpdateError;
      }
      
      // Update profile in database - include required fields email and role
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || formData.email, // Use user's email
          role: profileData?.role || 'customer', // Preserve existing role or default to customer
          full_name: formData.fullName,
          phone_number: formData.phone,
          date_of_birth: formData.dateOfBirth ? formData.dateOfBirth : null,
          updated_at: new Date().toISOString()
        });
      
      if (profileUpdateError) {
        throw profileUpdateError;
      }
      
      // Refresh session to get updated user data
      await refreshSession();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            Please sign in to view and edit your profile.
          </p>
          <a href="/sign-in" className="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-flysafari-dark">My Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-flysafari-primary/10 flex items-center justify-center mb-4">
                    <User size={36} className="text-flysafari-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    {formData.fullName || user.email}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {user.email}
                  </p>
                </div>
                
                <nav className="space-y-1">
                  <a 
                    href="#profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-flysafari-primary/10 text-flysafari-primary font-medium"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </a>
                  <a 
                    href="#security"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    <Lock size={16} />
                    <span>Security</span>
                  </a>
                  <a 
                    href="#notifications"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    <Bell size={16} />
                    <span>Notifications</span>
                  </a>
                </nav>
              </div>
            </div>
            
            {/* Profile form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-flysafari-primary hover:text-flysafari-primary/80"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`form-input pl-10 w-full ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true}
                          className="form-input pl-10 w-full bg-gray-50"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Email can only be changed in account settings
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`form-input pl-10 w-full ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`form-input pl-10 w-full ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="btn btn-primary py-2 px-6 flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
              
              {/* Account security section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Password & Security</h2>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Manage your password and security settings to keep your account secure.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <Lock size={20} className="text-flysafari-primary" />
                        <div>
                          <h3 className="font-medium">Password</h3>
                          <p className="text-sm text-gray-500">Update your password</p>
                        </div>
                      </div>
                      <button 
                        className="text-flysafari-primary hover:text-flysafari-primary/80 text-sm font-medium"
                        onClick={() => {
                          // Password reset flow
                          toast({
                            title: "Password Reset",
                            description: "Password reset functionality will be implemented soon.",
                          });
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
