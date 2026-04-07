import { create } from "zustand";

export const useFlightStore = create((set, get) => ({
  flights: [],
  selectedFlight: null,
  traceId: null,
  resultIndex: null,
  fareQuote: null,

  selectedMeal: null,
  selectedSeats: [],
  passengerCount: 1,

  clearBookings: () => {
    localStorage.removeItem("bookings");
    set({ bookings: [] });
  },

  setFlights: ({ flights, traceId }) =>
    set({
      flights: flights || [],
      traceId: traceId || null,
    }),

  setFlight: (flight) =>
    set({
      selectedFlight: flight || null,
      resultIndex:
        flight && flight.ResultIndex !== undefined ? flight.ResultIndex : null,
    }),

  setFareQuote: (fareQuote) => set({ fareQuote }),

  setPassengerCount: (count) => set({ passengerCount: count }),

  setSelectedMeal: (meal) => set({ selectedMeal: meal }),

  setSelectedSeats: (seats) => set({ selectedSeats: seats }),

  clearFlights: () =>
    set({
      flights: [],
      selectedFlight: null,
      traceId: null,
      resultIndex: null,
      fareQuote: null,
      selectedMeal: null,
      selectedSeats: [],
      passengerCount: 1,
    }),

  resetBooking: () =>
    set({
      selectedFlight: null,
      resultIndex: null,
      fareQuote: null,
      selectedMeal: null,
      selectedSeats: [],
    }),
}));
