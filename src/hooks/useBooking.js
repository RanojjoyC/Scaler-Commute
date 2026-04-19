import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { confirmSeat, cancelBooking, isBookingOpen } from "../services/bookingService";

export function useBooking() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function book({ slotId, slotTime, seatNumber, date }) {
    setError(null);

    if (!isBookingOpen(slotTime)) {
      setError("Booking closed — bus leaves in less than 10 minutes.");
      return null;
    }

    setLoading(true);
    try {
      const result = await confirmSeat({
        userId: user.uid,
        userEmail: user.email,
        slotId,
        slotTime,
        seatNumber,
        date,
      });
      return result; // { bookingId, status: "confirmed" | "waitlisted" }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function cancel(bookingId) {
    setError(null);
    setLoading(true);
    try {
      await cancelBooking(bookingId);
      return { success: true };
    } catch (err) {
      console.error("[useBooking Cancel Error]", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { book, cancel, loading, error, clearError: () => setError(null) };
}