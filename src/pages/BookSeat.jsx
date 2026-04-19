import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { subscribeToSlotBookings, getPricingTier } from "../services/bookingService";
import { ArrowRight } from "lucide-react";
import { useBooking } from "../hooks/useBooking";
import { useAuth } from "../context/AuthContext";
import SeatMap from "../components/SeatMap";
import InsightCard from "../components/InsightCard";

export default function BookSeat() {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { book, loading: bookingLoading, error: bookingError, clearError } = useBooking();

  const [slot, setSlot] = useState(null);
  const [takenSeats, setTakenSeats] = useState([]);
  const [myBookedSeat, setMyBookedSeat] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to slot changes
    const unsubSlot = onSnapshot(doc(db, "busSlots", slotId), (docSnap) => {
      if (docSnap.exists()) {
        setSlot({ id: docSnap.id, ...docSnap.data() });
      } else {
        setSlot(null);
      }
      setLoading(false);
    });

    // Listen to bookings for this slot to compute taken seats
    const unsubBookings = subscribeToSlotBookings(slotId, (bookings) => {
      const taken = [];
      let mine = null;
      bookings.forEach((b) => {
        if (b.userId === user.uid) {
          mine = b.seatNumber;
        } else {
          taken.push(b.seatNumber);
        }
      });
      setTakenSeats(taken);
      setMyBookedSeat(mine);
    });

    return () => {
      unsubSlot();
      unsubBookings();
    };
  }, [slotId, user.uid]);

  const { tier, price, label } = useMemo(() => {
    if (!slot) return { tier: "normal", price: 20, label: "Normal" };
    return getPricingTier(slot.bookedSeats, slot.totalSeats, slot.route);
  }, [slot]);

  const TIER_STYLES = {
    cheap: "bg-emerald-50 text-emerald-700",
    normal: "bg-blue-50 text-blue-700",
    surge: "bg-orange-50 text-orange-700",
  };

  async function handleConfirm() {
    if (!selectedSeat) return;

    // Attempt booking
    const result = await book({
      slotId,
      slotTime: slot.time,
      seatNumber: selectedSeat,
      date: slot.date,
    });

    if (result) {
      if (result.status === "waitlisted") {
        alert("The bus filled up! You have been placed on the waitlist.");
      }
      navigate("/my-bookings");
    }
  }

  if (loading) return <div className="text-[13px] text-gray-400">Loading seat map...</div>;
  if (!slot) return <div className="text-[13px] text-red-500">Slot not found.</div>;

  const occupancyPct = Math.round((slot.bookedSeats / slot.totalSeats) * 100);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight">Select your seat</h1>
          <p className="text-[14px] text-gray-500 font-semibold">Smart Campus Transport</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-[13px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Back to Schedule
        </button>
      </div>

      {bookingError && (
        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-[13px] flex items-center justify-between">
          <span>{bookingError}</span>
          <button onClick={clearError} className="font-semibold px-2">✕</button>
        </div>
      )}

      {myBookedSeat && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-lg text-[13px] font-medium">
          You already have a confirmed seat ({myBookedSeat}) on this bus.
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Col: Seat Map */}
        <div className="flex-1 bg-white border border-gray-100 rounded-xl p-6 w-full">
          <div className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-4">
            Seat Map
          </div>
          <SeatMap
            totalSeats={slot.totalSeats}
            takenSeats={takenSeats}
            selectedSeat={selectedSeat}
            onSelect={setSelectedSeat}
            myBookedSeat={myBookedSeat}
          />
        </div>

        {/* Right Col: Summary & Insight */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-4">
              Booking Summary
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Bus time</span>
                <span className="font-medium text-gray-900">{slot.time}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Route</span>
                <span className="font-medium text-gray-900">
                  {(!slot.route || slot.route === "U2_TO_CAMPUS") ? "U2 → Campus" : "Campus → U2"}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Seat</span>
                <span className="font-medium text-gray-900">{selectedSeat ? `Seat ${selectedSeat}` : "—"}</span>
              </div>
              <div className="flex justify-between text-[13px] items-center pt-2 border-t border-gray-100">
                <span className="text-gray-500">Pricing tier</span>
                <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${TIER_STYLES[tier]}`}>
                  {label}
                </span>
              </div>
              <div className="flex justify-between text-[15px] pt-1">
                <span className="text-gray-500">Price</span>
                <span className="font-medium text-gray-900">₹{price}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedSeat || bookingLoading || myBookedSeat}
              className="w-full bg-[#0353A4] text-white font-bold text-[15px] py-3 rounded-xl hover:bg-[#024080] transition-colors shadow-md disabled:opacity-50"
            >
              {bookingLoading ? "Confirming..." : "Confirm Seat"}
            </button>
          </div>

          {/* Occupancy Mini-card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-3">
              Occupancy
            </div>
            <div className="flex items-center text-[13px] text-gray-500 font-bold mb-4">
              {(!slot.route || slot.route === "U2_TO_CAMPUS") ? (
                <>Uniworld-2 <ArrowRight size={14} className="mx-1.5" /> Campus</>
              ) : (
                <>Campus <ArrowRight size={14} className="mx-1.5" /> Uniworld-2</>
              )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full mb-2">
              <div
                className={`h-2 rounded-full bg-[#0353A4]`}
                style={{ width: `${Math.min(occupancyPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
