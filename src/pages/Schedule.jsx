import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { subscribeToBusSlots, getUserBookings } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { Layers, Activity, Ticket } from "lucide-react";
import BusCard from "../components/BusCard";
import InsightCard from "../components/InsightCard";

const TODAY = () => new Date().toISOString().split("T")[0];

export default function Schedule() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("U2_TO_CAMPUS");

  // removed duplicate dateStr definition

  useEffect(() => {
    // 1. To claim tickets to today's active bus slots
    const unsub = subscribeToBusSlots(TODAY(), (data) => {
      setSlots(data);
      setLoading(false);
    });
    
    // 2. Fetch my bookings to know which buses I am currently on
    if (user?.uid) {
      getUserBookings(user.uid).then((bookings) => {
        // filter active bookings for today
        const activeToday = bookings.filter(
          (b) => b.date === TODAY() && (b.status === "confirmed" || b.status === "waitlisted")
        );
        setMyBookings(activeToday);
      });
    }

    return () => unsub();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-[14px] text-gray-500 font-medium">Loading schedule...</div>;
  }

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  
  const filteredSlots = slots.filter(s => (s.route || "U2_TO_CAMPUS") === activeTab);
  const totalSlots = filteredSlots.length;
  const seatsLeft = filteredSlots.reduce((acc, s) => acc + (s.totalSeats - s.bookedSeats), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight">Today's Schedule</h1>
        <p className="text-[14px] text-gray-500 font-semibold">{dateStr}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("U2_TO_CAMPUS")}
          className={`flex-1 min-w-[150px] py-2.5 text-[14px] font-bold rounded-lg transition-all ${
            activeTab === "U2_TO_CAMPUS" ? "bg-[#0353A4] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Uniworld-2 → Campus
        </button>
        <button
          onClick={() => setActiveTab("CAMPUS_TO_U2")}
          className={`flex-1 min-w-[150px] py-2.5 text-[14px] font-bold rounded-lg transition-all ${
            activeTab === "CAMPUS_TO_U2" ? "bg-[#0353A4] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Campus → Uniworld-2
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <InsightCard label="Total Slots" value={totalSlots} icon={Layers} />
        <InsightCard label="Seats Left" value={seatsLeft} accent={seatsLeft < 10 ? "amber" : "green"} icon={Activity} />
        <InsightCard label="My Bookings" value={myBookings.length} accent="blue" icon={Ticket} />
      </div>

      {filteredSlots.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500 font-medium shadow-sm">
          No buses scheduled for this route today.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSlots.map((slot) => {
            // Check if I have a booking for this specific slot ID
            const myBooking = myBookings.find((b) => b.slotId === slot.id);
            return (
              <BusCard 
                key={slot.id} 
                slot={slot} 
                isBooked={!!myBooking} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
