
import { useState, useEffect } from "react";
import { 
  Plane, 
  Users, 
  CreditCard, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  BarChart, 
  PieChart 
} from "lucide-react";

const AdminDashboard = () => {
  const [statsSummary, setStatsSummary] = useState({
    totalFlights: 124,
    activeFlights: 98,
    totalBookings: 1248,
    totalRevenue: 14589250,
    pendingBookings: 18,
    cancelledFlights: 6,
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const recentBookings = [
    { id: "BK12345", customer: "John Mwangi", flight: "KQ123 (Nairobi to Mombasa)", date: "2025-05-01", amount: 12500 },
    { id: "BK12346", customer: "Aisha Omondi", flight: "JM456 (Nairobi to Kisumu)", date: "2025-05-02", amount: 9800 },
    { id: "BK12347", customer: "David Kamau", flight: "FL789 (Mombasa to Nairobi)", date: "2025-05-03", amount: 11200 },
    { id: "BK12348", customer: "Faith Wanjiku", flight: "KQ321 (Kisumu to Nairobi)", date: "2025-05-03", amount: 10200 },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-flysafari-dark">Dashboard</h1>
        <p className="text-gray-600">Overview of your flight booking system</p>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500">Total Flights</p>
              <h3 className="text-2xl font-bold mt-1">{statsSummary.totalFlights}</h3>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                <span>8% increase</span>
              </p>
            </div>
            <div className="p-3 rounded-md bg-blue-50">
              <Plane className="h-6 w-6 text-flysafari-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold mt-1">{statsSummary.totalBookings}</h3>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                <span>12% increase</span>
              </p>
            </div>
            <div className="p-3 rounded-md bg-green-50">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">{formatPrice(statsSummary.totalRevenue)}</h3>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                <span>15% increase</span>
              </p>
            </div>
            <div className="p-3 rounded-md bg-purple-50">
              <CreditCard className="h-6 w-6 text-flysafari-accent" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500">Active Flights</p>
              <h3 className="text-2xl font-bold mt-1">{statsSummary.activeFlights}</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span>of {statsSummary.totalFlights} total</span>
              </p>
            </div>
            <div className="p-3 rounded-md bg-blue-50">
              <Calendar className="h-6 w-6 text-flysafari-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500">Pending Bookings</p>
              <h3 className="text-2xl font-bold mt-1">{statsSummary.pendingBookings}</h3>
              <p className="text-sm text-yellow-600 mt-1 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                <span>Needs attention</span>
              </p>
            </div>
            <div className="p-3 rounded-md bg-yellow-50">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500">Cancelled Flights</p>
              <h3 className="text-2xl font-bold mt-1">{statsSummary.cancelledFlights}</h3>
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                <span>{(statsSummary.cancelledFlights / statsSummary.totalFlights * 100).toFixed(1)}% of total</span>
              </p>
            </div>
            <div className="p-3 rounded-md bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart size={18} className="text-flysafari-primary" />
              <span>Bookings Overview</span>
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Booking stats chart would appear here.</p>
              <p className="text-sm mt-1">Showing data for last 30 days</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <PieChart size={18} className="text-flysafari-primary" />
              <span>Revenue by Route</span>
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <PieChart size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Revenue distribution chart would appear here.</p>
              <p className="text-sm mt-1">Showing data for current month</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent bookings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Recent Bookings</h3>
          <button className="text-flysafari-primary text-sm">View all</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Booking ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Flight</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking, index) => (
                <tr key={booking.id} className={index !== recentBookings.length - 1 ? "border-b" : ""}>
                  <td className="px-4 py-3 text-sm font-medium">{booking.id}</td>
                  <td className="px-4 py-3 text-sm">{booking.customer}</td>
                  <td className="px-4 py-3 text-sm">{booking.flight}</td>
                  <td className="px-4 py-3 text-sm">{booking.date}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatPrice(booking.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
