/**
 * Booking Context - Pass booking form data to chat widget
 */

import { createContext, useContext, useState, ReactNode } from "react";

interface BookingData {
  name?: string;
  email?: string;
  phone?: string;
  package?: string;
  message?: string;
}

interface BookingContextType {
  bookingData: BookingData | null;
  setBookingData: (data: BookingData | null) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
