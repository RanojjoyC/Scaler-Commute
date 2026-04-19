import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bus, LogOut, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const links = [
    { to: "/", label: "Schedule" },
    { to: "/my-bookings", label: "My Bookings" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0353A4] px-6 h-16 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 no-underline text-white group">
        <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
          <Bus size={22} className="text-white drop-shadow-md" />
        </div>
        <div className="flex flex-col relative top-px">
          <span className="text-[17px] font-bold tracking-wide leading-tight drop-shadow-sm">Scaler Commute</span>
          <span className="text-[11px] text-blue-200 leading-tight font-medium">Smart Campus Transport</span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="flex gap-2 bg-[#024080] p-1.5 rounded-2xl shadow-inner border border-white/5">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`px-4 py-1.5 rounded-xl text-[13px] no-underline font-semibold transition-all flex items-center gap-1.5 ${
              location.pathname === l.to
                ? "bg-white text-[#0353A4] shadow-md scale-[1.02]"
                : "text-blue-100 hover:text-white hover:bg-white/10"
            }`}
          >
            {l.label === "Admin" && <ShieldAlert size={14} />}
            {l.label}
          </Link>
        ))}
      </div>

      {/* User */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 bg-white/5 p-1 pr-3 rounded-full border border-white/10">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[12px] font-bold text-[#0353A4] shadow-sm">
            {initials}
          </div>
          <span className="text-[14px] font-semibold text-white hidden md:block">
            {profile?.name || user?.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[13px] font-bold text-blue-100 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}