import { useState, useEffect } from "react";
import { getUserBookings, cancelBooking, isCancellationOpen } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { useInsights } from "../hooks/useInsights";
import { useBooking } from "../hooks/useBooking";
import { Coins, HandCoins, Flame, Crosshair } from "lucide-react";
import InsightCard from "../components/InsightCard";

export default function MyBookings() {
  const { user } = useAuth();
  const { cancel, loading: canceling } = useBooking();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive insights from booking history
  const insights = useInsights(bookings);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  async function fetchBookings() {
    if (!user?.uid) return;
    setLoading(true);
    const data = await getUserBookings(user.uid);
    setBookings(data);
    setLoading(false);
  }

  async function handleCancel(id) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    const result = await cancel(id);
    if (result && result.success === true) {
      await fetchBookings(); // refresh
    } else {
      alert("Failed to cancel: " + (result?.error || "Unknown database rejection. Please check console logs."));
    }
  }

  if (loading) return <div className="text-[13px] text-gray-400">Loading bookings...</div>;

  const STATUS_STYLES = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    waitlisted: "bg-amber-50 text-amber-700 border-amber-100",
    cancelled: "bg-gray-50 text-gray-500 border-gray-200",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Bookings</h1>
        <p className="text-[14px] text-gray-500">Manage your trips and view your commute insights</p>
      </div>

      {/* Behavioral Insights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <InsightCard 
          label="Money Saved vs Autos" 
          value={`₹${insights.totalSaved}`} 
          description="Total estimated savings"
          accent="green" 
          icon={Coins}
        />
        <InsightCard 
          label="Avg Auto Cost" 
          value={`₹${insights.avgPrice}`} 
          description={`Compared to ₹${insights.autoComparison} sharing auto`}
          accent="blue" 
          icon={HandCoins}
        />
        <InsightCard 
          label="Commute Streak" 
          value={`${insights.streak} days`} 
          description="Current daily commute streak"
          accent="amber" 
          icon={Flame}
        />
        <InsightCard 
          label="Cost Optimization" 
          value={`${insights.missedCheapRides} missed`} 
          description="Surge rides booked when cheap ones existed"
          accent="gray" 
          icon={Crosshair}
        />
      </div>

      <div className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-4">
        Booking History
      </div>

      {bookings.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-[13px] text-gray-500">You haven't booked any buses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[16px] font-medium text-gray-900">{b.slotTime}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[b.status]}`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>
                <div className="text-[13px] text-gray-500 font-semibold flex items-center">
                  {b.date} <span className="mx-2 text-gray-300">|</span> 
                  {(!b.route || b.route === "U2_TO_CAMPUS") ? "U2 → Campus" : "Campus → U2"}
                  <span className="ml-2 text-gray-400 font-normal">· Seat {b.seatNumber}</span>
                </div>
              </div>

              {/* Actions */}
              {(b.status === "confirmed" || b.status === "waitlisted") && (
                <div className="flex flex-col items-center sm:items-end">
                  {b.date === new Date().toISOString().split("T")[0] && !isCancellationOpen(b.slotTime) ? (
                    <div className="text-[12px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-center">
                      Locked (&lt;20 mins to departure)
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={canceling}
                      className="w-full sm:w-auto px-4 py-2 text-[13px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-center disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
