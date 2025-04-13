
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, UserPlus, Shield, AlertCircle, Search, RefreshCw } from "lucide-react";
import { makeUserAdmin } from "@/integrations/supabase/makeAdmin";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_login?: string;
}

const AdminUserManagement = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPromotingUser, setIsPromotingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      // Convert profiles to UserProfile format
      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        email: "", // Will be filled in the next step if possible
        name: profile.full_name || "No Name",
        role: profile.role,
        created_at: profile.created_at,
        last_login: undefined
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromoteToAdmin = async (userId: string) => {
    if (!user || isPromotingUser) return;

    setIsPromotingUser(userId);
    try {
      // First, update the user's role in Clerk using the token
      try {
        const token = await getToken();
        
        // Make API call to your backend or custom function to update Clerk metadata
        const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            publicMetadata: { role: 'admin' }
          })
        });
        
        if (!clerkResponse.ok) {
          throw new Error('Failed to update Clerk metadata');
        }
      } catch (clerkError) {
        console.error("Error updating Clerk metadata:", clerkError);
        toast({
          title: "Clerk API Error",
          description: "Could not update user role in Clerk. Please check your API keys and permissions.",
          variant: "destructive"
        });
        throw clerkError;
      }

      // Then update the role in Supabase
      const success = await makeUserAdmin(userId);

      if (!success) {
        throw new Error("Failed to update user role in Supabase");
      }

      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: 'admin' } : u
        )
      );

      toast({
        title: "Success",
        description: "User has been promoted to admin role.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error promoting user:", error);
      toast({
        title: "Error",
        description: "Failed to promote user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPromotingUser(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Users className="text-flysafari-primary" size={24} />
          <h2 className="text-xl font-semibold">User Management</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 pr-4 py-2 w-full sm:w-64"
            />
          </div>
          
          <button
            onClick={fetchUsers}
            className="btn btn-outline p-2"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-flysafari-primary"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <Users className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500">No users found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 whitespace-nowrap">{user.name || 'N/A'}</td>
                  <td className="p-3 whitespace-nowrap">{user.email || 'N/A'}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {user.role !== 'admin' ? (
                      <button
                        onClick={() => handlePromoteToAdmin(user.id)}
                        disabled={isPromotingUser === user.id}
                        className="btn btn-sm btn-outline flex items-center gap-1"
                      >
                        {isPromotingUser === user.id ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Shield size={14} />
                            Make Admin
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500 italic flex items-center gap-1">
                        <Shield size={14} className="text-purple-500" />
                        Admin
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 bg-yellow-50 p-4 rounded-md flex items-start gap-3">
        <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-800">Admin Permissions Note</h3>
          <p className="text-sm mt-1 text-yellow-700">
            Admins have full access to manage flights, view all bookings, and promote other users. 
            Only grant admin access to trusted individuals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
