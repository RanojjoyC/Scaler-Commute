import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, ArrowRight, CreditCard, ChevronRight } from "lucide-react";
import { getPricingTier, isBookingOpen } from "../services/bookingService";

const TIER_STYLES = {
  cheap:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  normal: { badge: "bg-blue-50 text-[#0353A4] border-[#0353A4]/30",       bar: "bg-[#0353A4]"    },
  surge:  { badge: "bg-amber-50 text-amber-700 border-amber-200",   bar: "bg-amber-500"  },
};

export default function BusCard({ slot, isBooked = false }) {
  const navigate = useNavigate();

  const { tier, price, label } = useMemo(
    () => getPricingTier(slot.bookedSeats, slot.totalSeats, slot.route),
    [slot.bookedSeats, slot.totalSeats, slot.route]
  );

  const occupancyPct = Math.round((slot.bookedSeats / slot.totalSeats) * 100);
  const seatsLeft = slot.totalSeats - slot.bookedSeats;
  const isFull = seatsLeft <= 0;
  const bookingOpen = isBookingOpen(slot.time);
  const styles = TIER_STYLES[tier];

  function handleClick() {
    if (!bookingOpen) return;
    navigate(`/book/${slot.id}`);
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white border rounded-2xl p-5 transition-all shadow-sm group relative ${
        isBooked
          ? "border-[#0353A4] border-[2.5px] shadow-lg ring-4 ring-[#0353A4]/10"
          : bookingOpen
          ? "border-gray-200 hover:border-[#0353A4] hover:shadow-lg cursor-pointer"
          : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex gap-4 items-center">
          <div className={`p-3.5 rounded-2xl shadow-inner ${isBooked ? 'bg-[#0353A4] text-white' : 'bg-blue-50 text-[#0353A4]'}`}>
            <Clock size={28} />
          </div>
          <div>
            <div className="text-[22px] font-black text-gray-900 leading-none mb-1.5">{slot.time}</div>
            <div className="flex items-center text-[13px] text-gray-500 font-bold">
              {(!slot.route || slot.route === "U2_TO_CAMPUS") ? (
                <>Uniworld-2 <ArrowRight size={14} className="mx-1.5" /> Campus</>
              ) : (
                <>Campus <ArrowRight size={14} className="mx-1.5" /> Uniworld-2</>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isBooked && (
            <span className="text-[12px] bg-[#0353A4] text-white px-3 py-1 rounded-full font-black shadow-md border border-[#024080]">
              YOUR BUS
            </span>
          )}
          {isFull ? (
            <span className="text-[12px] bg-red-50 text-red-700 px-3 py-1 rounded-full font-black border border-red-200">FULL</span>
          ) : (
            <span className={`text-[12px] px-3 py-1 rounded-full border font-black ${styles.badge}`}>
              {label.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="h-2.5 bg-gray-100 rounded-full mb-4 overflow-hidden border border-gray-200/50">
        <div
          className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
          style={{ width: `${Math.min(occupancyPct, 100)}%` }}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-5 border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2.5 text-[15px] font-semibold text-gray-600">
          <Users size={18} className={isFull ? 'text-red-500' : 'text-[#0353A4]'} />
          {isFull
            ? <span className="text-red-600 font-bold">{slot.waitlistCount || 0} on waitlist</span>
            : <span><strong className="text-gray-900 text-[16px]">{slot.bookedSeats}</strong> / {slot.totalSeats} booked</span>}
        </div>
        
        <div className="flex items-center gap-3">
          {isFull ? (
            <span className="text-[13px] bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold border border-amber-200 shadow-sm">
              Join Waitlist
            </span>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-[20px] font-bold text-gray-900 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200">
                <CreditCard size={18} className="text-gray-400" />
                ₹{price}
              </div>
              <div className="bg-[#0353A4] text-white p-2 rounded-xl shadow-md hidden group-hover:flex transition-all">
                <ChevronRight size={18} />
              </div>
            </>
          )}
        </div>
      </div>

      {!bookingOpen && (
        <div className="mt-4 text-[13px] font-bold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl text-center">
          Booking closed — bus departs in less than 10 mins!
        </div>
      )}
    </div>
  );
}