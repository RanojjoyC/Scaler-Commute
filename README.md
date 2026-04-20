# 🚌 Scaler Commute

**Scaler Commute** is a modern, real-time bus booking platform designed specifically to streamline daily campus transportation for students and staff. Built to handle production-level traffic, the platform eliminates the chaos of manual queueing and guarantees an organized, transparent commuting experience.

By offering features like interactive seat selection and dynamic waitlisting, Scaler Commute ensures that every bus journey is predictable, fair, and efficiently managed right from your pocket.

## ✨ Core Features

- **🎯 Real-Time Seat Booking:** Browse available buses, view live seating layouts, and reserve your specific seat instantly before boarding.
- **⏳ Smart Waitlist System:** If a bus is fully booked, intelligently add yourself to the waitlist. If a confirmed passenger cancels, the system automatically processes the queue and notifies waitlisted users.
- **🚥 Departure Enforcement Rules:** To maintain schedules and prevent last-minute boarding confusion, the platform strictly disables new bookings 10 minutes prior to a bus's scheduled departure time.
- **🔒 Secure User Authentication:** Powered securely by Firebase, ensuring that only verified campus members can book seats and manage their commute schedules.
- **📱 Responsive & Accessible UI:** Designed with a vibrant, intuitive interface using Tailwind CSS, ensuring smooth booking experiences whether on a mobile phone heading to class or on a desktop.
- **📅 Centralized Dashboard:** A personalized view for users to track their active bookings, review historical travel data, and seamlessly cancel upcoming rides if plans change.

## 💡 How It Works
The platform acts as a bridge between the campus transport fleet and daily commuters:
1. **Discover:** Users log in to see the complete schedule of buses serving the campus for the day.
2. **Select & Reserve:** Commuters can visually pick an available seat on their desired route. 
3. **Manage:** If plans change, a one-click cancellation ensures that the seat is immediately freed up for the next person in need, automatically moving waitlisted users up the line.

## 🛠️ Technology Stack
- **Frontend Architecture:** React 19 + Vite
- **Styling & UI:** Tailwind CSS v4, Lucide React icons
- **State Management & Routing:** React Router v7, Context APIs
- **Backend Infrastructure:** Firebase (Authentication, Real-time persistence, and secure transaction handling)

---
*Scaler Commute focuses purely on the commuter's journey—making every trip to and from the campus as smooth and reliable as possible.*
