import { useState, useEffect } from "react";
import { subscribeToBusSlots, addBusSlot, deleteBusSlot, updateBusSlot } from "../services/bookingService";
import { LayoutDashboard, Users, Activity } from "lucide-react";
import InsightCard from "../components/InsightCard";

const TODAY = () => new Date().toISOString().split("T")[0];

export default function Admin() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotSeats, setNewSlotSeats] = useState("");
  const [newSlotRoute, setNewSlotRoute] = useState("U2_TO_CAMPUS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBusSlots(TODAY(), (data) => {
      setSlots(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleAddSlot(e) {
    e.preventDefault();
    if (!newSlotTime || !newSlotSeats) return;
    setIsSubmitting(true);
    try {
      await addBusSlot({ time: newSlotTime, totalSeats: Number(newSlotSeats), route: newSlotRoute });
      setNewSlotTime("");
      setNewSlotSeats("");
      setNewSlotRoute("U2_TO_CAMPUS");
    } catch (err) {
      alert("Error adding slot: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to cancel this bus?")) return;
    try {
      await deleteBusSlot(id);
    } catch (err) {
      alert("Error deleting slot: " + err.message);
    }
  }

  async function handleEdit(id, currentSeats) {
    const newSeats = window.prompt("Enter new total seat capacity:", currentSeats);
    if (newSeats === null) return;
    const count = parseInt(newSeats, 10);
    if (isNaN(count) || count < 1) return alert("Invalid capacity");
    try {
      await updateBusSlot(id, { totalSeats: count });
    } catch (err) {
      alert("Error updating slot");
    }
  }

  // Stats
  const totalSlots = slots.length;
  const avgOccupancy = totalSlots > 0 
    ? Math.round((slots.reduce((acc, s) => acc + (s.bookedSeats / s.totalSeats), 0) / totalSlots) * 100)
    : 0;
  
  if (loading) return <div className="text-[13px] text-gray-400">Loading admin dashboard...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-[14px] text-gray-500">Manage today's bus slots and monitor capacity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <InsightCard label="Total Slots Today" value={totalSlots} icon={LayoutDashboard} />
        <InsightCard label="Avg Occupancy" value={`${avgOccupancy}%`} accent="blue" icon={Users} />
        <InsightCard label="Status" value="Live" accent="green" icon={Activity} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* ADD SLOT FORM */}
        <div className="w-full md:w-80 bg-white border border-gray-100 rounded-xl p-5 shrink-0">
          <div className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-4">
            Add New Slot
          </div>
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Time</label>
                <input
                  type="time"
                  required
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-semibold focus:outline-none focus:border-[#0353A4] focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Seats</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={newSlotSeats}
                  onChange={(e) => setNewSlotSeats(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-semibold focus:outline-none focus:border-[#0353A4] focus:bg-white transition-colors"
                  placeholder="e.g. 40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Route</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewSlotRoute("U2_TO_CAMPUS")}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg border transition-all ${
                    newSlotRoute === "U2_TO_CAMPUS" ? "bg-blue-50 border-[#0353A4]/30 text-[#0353A4] shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >U2 → Campus</button>
                <button
                  type="button"
                  onClick={() => setNewSlotRoute("CAMPUS_TO_U2")}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg border transition-all ${
                    newSlotRoute === "CAMPUS_TO_U2" ? "bg-blue-50 border-[#0353A4]/30 text-[#0353A4] shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >Campus → U2</button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0353A4] text-white font-bold text-[14px] py-3 rounded-xl hover:bg-[#024080] transition-colors disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? "Adding..." : "+ Add slot"}
            </button>
          </form>
        </div>

        {/* LIST TODAY'S SLOTS */}
        <div className="flex-1 w-full bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-4">
            Today's Slots
          </div>
          
          {slots.length === 0 ? (
            <div className="text-[13px] text-gray-500 text-center py-6">No slots scheduled for today.</div>
          ) : (
            <div className="space-y-3">
              {slots.map(s => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                  <div className="flex justify-between items-start mb-3 sm:mb-0">
                    <div>
                      <div className="text-[18px] font-bold text-gray-900 leading-none mb-1 text-left">{s.time}</div>
                      <div className="text-[12px] text-gray-500 font-medium">
                        {(!s.route || s.route === "U2_TO_CAMPUS") ? "U2 → Campus" : "Campus → U2"}
                      </div>
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded text-[12px] font-semibold text-gray-600 sm:ml-4">
                      {s.bookedSeats} / {s.totalSeats}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(s.id, s.totalSeats)}
                      className="px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-3 py-1.5 text-[12px] font-medium text-red-600 bg-white border border-gray-200 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
