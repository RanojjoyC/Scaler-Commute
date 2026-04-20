# 🚌 Scaler Commute

**Scaler Commute** is a modern, real-time bus booking platform designed specifically to streamline daily campus transportation for students and staff. Built to handle production-level traffic, the platform eliminates the chaos of manual queueing and guarantees an organized, transparent commuting experience.

By offering features like interactive seat selection and dynamic waitlisting, Scaler Commute ensures that every bus journey is predictable, fair, and efficiently managed right from your pocket.

## ✨ Features and Controls

The platform is divided into two tailored experiences, providing complete visibility and control over campus transportation.

### 🎓 Student / Commuter Controls
Designed for speed, reliability, and ease of use on the go.

- **Real-Time Seat Booking:** Browse available bus slots for both routes (U2 → Campus and Campus → U2). Check live seating layouts and reserve your seat instantly before boarding.
- **Smart Waitlist System:** If a bus is fully booked, intelligently add yourself to the waitlist. If a confirmed passenger cancels, the system automatically processes the queue and upgrades waitlisted users.
- **My Bookings Dashboard:** A centralized, personalized view to track active bookings, review historical travel data, and effortlessly manage travel plans.
- **One-Click Cancellation:** Easily cancel upcoming rides if plans change. The seat is instantly freed up, and waitlisted members are automatically bumped up.
- **Departure Enforcement Rules:** To maintain schedules and prevent last-minute boarding confusion, the platform strictly disables new bookings 10 minutes prior to a bus's scheduled departure time.
- **Responsive & Accessible UI:** Designed with a vibrant, intuitive interface using Tailwind CSS, ensuring smooth experiences on any device.

### 🛡️ Administrator Controls
A comprehensive dashboard to manage the fleet, monitor traffic, and adapt supply to commuter demand in real-time.

- **Live Command Center:** Access an overview of the day's operations, including total scheduled slots, average fleet occupancy percentages, and live system status.
- **Dynamic Slot Management:** Add new bus slots on-the-fly. Configure the departure time, assign total passenger capacity, and select the specific route.
- **Real-Time Occupancy Tracking:** Monitor the live fill-rate (Booked Seats vs. Total Seats) for every active bus throughout the day.
- **Modify Capacity in Real-Time:** Edit the total seat capacity for an existing active slot to accommodate last-minute larger buses or vehicle changes.
- **Slot Cancellation:** Instantly delete or cancel bus slots in the event of breakdowns or schedule changes.

## 💡 How It Works
The platform acts as a bridge between the campus transport fleet and daily commuters:
1. **Discover:** Users log in securely to see the complete schedule of buses serving the campus for the day.
2. **Select & Reserve:** Commuters can visually pick an available seat on their desired route. 
3. **Manage:** If plans change, a one-click cancellation ensures that the seat is immediately freed up for the next person in need. Administrators monitor the entire ecosystem, adding or adjusting services as demand requires.

## 🛠️ Technology Stack
- **Frontend Architecture:** React 19 + Vite
- **Styling & UI:** Tailwind CSS v4, Lucide React icons
- **State Management & Routing:** React Router v7, Context APIs
- **Backend Infrastructure:** Firebase (Authentication, Real-time persistence, and secure transaction handling)

---
*Scaler Commute focuses purely on the commuter's journey—making every trip to and from the campus as smooth and reliable as possible.*
