import { useMemo } from "react";

export default function SeatMap({ totalSeats, takenSeats = [], selectedSeat, onSelect, myBookedSeat = null }) {
  const seats = useMemo(
    () => Array.from({ length: totalSeats }, (_, i) => i + 1),
    [totalSeats]
  );

  function getSeatState(num) {
    if (num === myBookedSeat) return "mine";
    if (num === selectedSeat) return "selected";
    if (takenSeats.includes(num)) return "taken";
    return "available";
  }

  const stateStyles = {
    available: "bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer border border-gray-200",
    selected:  "bg-emerald-500 text-white cursor-pointer border border-emerald-500",
    taken:     "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50 border border-gray-100",
    mine:      "bg-emerald-50 text-emerald-700 cursor-default border-[1.5px] border-emerald-400",
  };

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: "Available", style: "bg-gray-100 border border-gray-200" },
          { label: "Selected",  style: "bg-emerald-500" },
          { label: "Yours",     style: "bg-emerald-50 border-[1.5px] border-emerald-400" },
          { label: "Taken",     style: "bg-gray-100 opacity-50 border border-gray-100" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-[3px] ${item.style}`} />
            <span className="text-[11px] text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Bus front indicator */}
      <div className="text-center text-[11px] text-gray-300 mb-2 tracking-widest uppercase">
        ── Driver ──
      </div>

      {/* Seat grid — 4 columns with aisle gap between col 2 and 3 */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr 8px 1fr 1fr" }}>
        {seats.map((num) => {
          const col = ((num - 1) % 4) + 1; // 1-4
          const state = getSeatState(num);

          // Insert aisle spacer after column 2
          const elements = [];
          if (col === 3) {
            elements.push(<div key={`aisle-${num}`} />); // aisle
          }

          elements.push(
            <button
              key={num}
              disabled={state === "taken" || state === "mine"}
              onClick={() => state === "available" && onSelect(num)}
              className={`h-8 rounded-md text-[11px] font-medium transition-all ${stateStyles[state]}`}
            >
              {num}
            </button>
          );

          return elements;
        })}
      </div>

      <div className="text-center text-[11px] text-gray-300 mt-2 tracking-widest uppercase">
        ── Rear ──
      </div>
    </div>
  );
}