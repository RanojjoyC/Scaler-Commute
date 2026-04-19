import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const TODAY = () => new Date().toISOString().split("T")[0];

// Pricing logic based on real observations made by me on Uber Auto
export function getPricingTier(bookedSeats, totalSeats, route = "U2_TO_CAMPUS") {
  const occupancy = bookedSeats / totalSeats;
  const isReturn = (route === "CAMPUS_TO_U2");
  const basePrice = isReturn ? 15 : 20;
  
  if (occupancy < 0.4) return { tier: "cheap", price: basePrice, label: "Cheap" };
  if (occupancy < 0.75) return { tier: "normal", price: basePrice + 15, label: "Normal" };
  return { tier: "surge", price: basePrice + 30, label: "Surge" };
}

// Booking & Cancellation window checks 
export function isBookingOpen(slotTime) {
  const [hours, minutes] = slotTime.split(":").map(Number);
  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);
  const now = new Date();
  const diffMins = (slotDate - now) / 1000 / 60;
  return diffMins > 10; // must be > 10 mins away
}

export function isCancellationOpen(slotTime) {
  const [hours, minutes] = slotTime.split(":").map(Number);
  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);
  const now = new Date();
  const diffMins = (slotDate - now) / 1000 / 60;
  return diffMins > 20; // students can cancel until 20 mins before departure
}

// All Slots

export async function getBusSlotsForDate(date = TODAY()) {
  const q = query(
    collection(db, "busSlots"),
    where("date", "==", date),
    where("status", "==", "active"),
    orderBy("time")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToBusSlots(date = TODAY(), callback) {
  const q = query(
    collection(db, "busSlots"),
    where("date", "==", date),
    where("status", "==", "active"),
    orderBy("time")
  );
  return onSnapshot(q, (snap) => {
    let slots = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // Auto hide already departed bus
    if (date === TODAY()) {
      const now = new Date();
      slots = slots.filter(s => {
        const [hours, minutes] = s.time.split(":").map(Number);
        const slotTimeObj = new Date();
        slotTimeObj.setHours(hours, minutes, 0, 0);
        return now < slotTimeObj;
      });
    }
    
    callback(slots);
  }, (error) => {
    console.error("Firestore Error in subscribeToBusSlots:", error);
    alert("Database Error (Bus Slots): " + error.message + "\nCheck the browser console for the link to create the index!");
    callback([]);
  });
}

export async function addBusSlot({ time, totalSeats, date = TODAY(), route = "U2_TO_CAMPUS" }) {
  return await addDoc(collection(db, "busSlots"), {
    time,
    totalSeats: Number(totalSeats),
    bookedSeats: 0,
    date,
    route,
    status: "active",
    createdAt: serverTimestamp(),
  });
}

export async function updateBusSlot(slotId, updates) {
  await updateDoc(doc(db, "busSlots", slotId), updates);
}

export async function deleteBusSlot(slotId) {
  // Admin cancellation affects all
  const batch = writeBatch(db);
  batch.update(doc(db, "busSlots", slotId), { status: "cancelled" });

  const q = query(collection(db, "bookings"), where("slotId", "==", slotId));
  const snap = await getDocs(q);
  snap.forEach((d) => {
    batch.update(d.ref, { status: "cancelled" });
  });

  await batch.commit();
}

// All bookings

export async function getBookedSeatsForSlot(slotId) {
  const q = query(
    collection(db, "bookings"),
    where("slotId", "==", slotId),
    where("status", "in", ["confirmed", "waitlisted"])
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToSlotBookings(slotId, callback) {
  const q = query(
    collection(db, "bookings"),
    where("slotId", "==", slotId),
    where("status", "in", ["confirmed", "waitlisted"])
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.error("Firestore Error in subscribeToSlotBookings:", error);
    callback([]); // Stop loading
  });
}

export async function getUserBookings(userId) {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
}

// to confirm seat in sync with firestore DB
export async function confirmSeat({ userId, userEmail, slotId, slotTime, seatNumber, date = TODAY() }) {
  return await runTransaction(db, async (transaction) => {
    const slotRef = doc(db, "busSlots", slotId);
    const slotSnap = await transaction.get(slotRef);

    if (!slotSnap.exists()) throw new Error("Bus slot not found.");

    const slot = slotSnap.data();

    // Check if seat isn't already taken
    const bookingsSnap = await getDocs(
      query(
        collection(db, "bookings"),
        where("slotId", "==", slotId),
        where("seatNumber", "==", seatNumber),
        where("status", "in", ["confirmed", "waitlisted"])
      )
    );
    if (!bookingsSnap.empty) throw new Error("Seat just got taken. Please pick another.");

    const isFull = slot.bookedSeats >= slot.totalSeats;
    const status = isFull ? "waitlisted" : "confirmed";

    const bookingRef = doc(collection(db, "bookings"));
    transaction.set(bookingRef, {
      userId,
      userEmail,
      slotId,
      slotTime,
      route: slot.route || "U2_TO_CAMPUS",
      seatNumber,
      status,
      date,
      createdAt: serverTimestamp(),
    });

    if (!isFull) {
      transaction.update(slotRef, { bookedSeats: slot.bookedSeats + 1 });
    }

    return { bookingId: bookingRef.id, status };
  });
}

// Cancel booking + auto-confirm first waitlisted person
export async function cancelBooking(bookingId) {
  // Read booking state safely outside of transaction constraints
  const bookingRef = doc(db, "bookings", bookingId);
  const bookingSnap = await getDoc(bookingRef);
  if (!bookingSnap.exists()) throw new Error("Booking not found.");
  const booking = bookingSnap.data();

  // Scout waitlist candidates via fast JS filtering outside of the atomic lock
  let waitlistCandidate = null;
  if (booking.status === "confirmed") {
    const q = query(collection(db, "bookings"), where("slotId", "==", booking.slotId));
    const allBookingsSnap = await getDocs(q); 
    
    const waitlisted = [];
    allBookingsSnap.forEach((d) => {
      const data = d.data();
      if (data.status === "waitlisted" && d.id !== bookingId) {
        waitlisted.push({ id: d.id, ...data });
      }
    });
    
    waitlisted.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
    if (waitlisted.length > 0) {
      waitlistCandidate = waitlisted[0];
    }
  }

  return await runTransaction(db, async (transaction) => {
    // Re-verify it hasn't somehow been cancelled already
    const currentSnap = await transaction.get(bookingRef);
    if (!currentSnap.exists()) return;

    // ALL reads must occur before ANY writes in Firestore transactions
    let slotSnap = null;
    let slotRef = null;
    if (booking.status === "confirmed") {
      slotRef = doc(db, "busSlots", booking.slotId);
      slotSnap = await transaction.get(slotRef);
    }

    // Now execute all writes
    transaction.update(bookingRef, { status: "cancelled" });

    if (booking.status === "confirmed") {
      if (waitlistCandidate) {
        // Slide a waitlist user exactly into the freed seat
        const targetRef = doc(db, "bookings", waitlistCandidate.id);
        transaction.update(targetRef, { 
          status: "confirmed", 
          seatNumber: booking.seatNumber 
        });
      } else {
        // Decrease bus capacity by 1 if there's no backup rider
        if (slotSnap.exists()) {
          transaction.update(slotRef, {
            bookedSeats: Math.max(0, slotSnap.data().bookedSeats - 1),
          });
        }
      }
    }
  });
}

// Users 
export async function createUserProfile(userId, { name, email, role = "student" }) {
  await addDoc(collection(db, "users"), {
    userId,
    name,
    email,
    role,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(userId) {
  const q = query(collection(db, "users"), where("userId", "==", userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}