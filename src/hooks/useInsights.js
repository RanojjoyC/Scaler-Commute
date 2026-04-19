import { useMemo } from "react";

export function useInsights(bookings) {
  return useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        totalSaved: 0,
        avgPrice: 0,
        streak: 0,
        missedCheapRides: 0,
        totalRides: 0,
        autoComparison: 0,
      };
    }

    const confirmed = bookings.filter(
      (b) => b.status === "confirmed"
    );

    const totalRides = confirmed.length;

    // Estimate total spent using new base price if not logged natively
    const totalSpent = confirmed.reduce((sum, b) => {
      const base = b.route === "CAMPUS_TO_U2" ? 15 : 20;
      return sum + (b.price || base);
    }, 0);
    const avgPrice = totalRides > 0 ? Math.round(totalSpent / totalRides) : 0;

    // Calculate real-world sharing auto pricing based on the specific route taken
    let totalAutoCost = 0;
    confirmed.forEach((b) => {
      if (b.route === "CAMPUS_TO_U2") {
        totalAutoCost += 17; // 46-52 Rs / 3 people
      } else {
        totalAutoCost += 26; // 75-80 Rs / 3 people (fallback as well)
      }
    });

    const avgAutoCost = totalRides > 0 ? Math.round(totalAutoCost / totalRides) : 0;
    // Money saved vs sharing auto cost
    const totalSaved = Math.round(totalAutoCost - totalSpent);

    // Missed cheap rides (assumes anything > base is a missed cheap ride)
    const missedCheapRides = confirmed.filter((b) => {
      const base = b.route === "CAMPUS_TO_U2" ? 15 : 20;
      return (b.price || base) > base;
    }).length;

    // Booking streak — consecutive unique dates up to today
    const dates = [
      ...new Set(confirmed.map((b) => b.date).filter(Boolean)),
    ].sort((a, b) => (a > b ? -1 : 1)); // desc

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (dates[i] === expectedStr) streak++;
      else break;
    }

    // Favorite slot time
    const timeCounts = {};
    confirmed.forEach((b) => {
      if (b.slotTime) timeCounts[b.slotTime] = (timeCounts[b.slotTime] || 0) + 1;
    });
    const favoriteTime =
      Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalSaved,
      avgPrice,
      streak,
      missedCheapRides,
      totalRides,
      autoComparison: avgAutoCost,
      favoriteTime,
    };
  }, [bookings]);
}