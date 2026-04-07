import { useLocation, useNavigate } from "react-router-dom";
import { useFlightStore } from "../../../store/flightStore";
import { privateApi } from "../../../services/api";
import { useState } from "react";

const ReviewBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    passengers,
    selectedSeats,
    selectedMeal,
    selectedFlight,
    traceId,
    resultIndex,
  } = location.state || {};

  const [loading, setLoading] = useState(false);

  if (!passengers) {
    return (
      <div className="flex justify-center items-center h-screen">
        Missing booking data
      </div>
    );
  }

  const baseFare =
    selectedFlight?.Fare?.PublishedFare ||
    selectedFlight?.Fare?.OfferedFare ||
    0;

  const seatPrice =
    selectedSeats?.reduce((sum, s) => sum + (s.Price || 0), 0) || 0;

  const mealPrice = selectedMeal?.Price || 0;

  const totalPrice = baseFare + seatPrice + mealPrice;

  const handleBook = async () => {
    if (!traceId || !resultIndex) {
      alert("Flight session expired. Please search again.");
      navigate("/");
      return;
    }
    try {
      setLoading(true);

      const quoteRes = await privateApi.post("/api/airlines/fare-quote/", {
        TraceId: traceId,
        ResultIndex: resultIndex,
      });

      const response =
        quoteRes?.data?.data?.Response || quoteRes?.data?.Response;

      const newTraceId = response?.TraceId;
      const newResultIndex = response?.Results?.ResultIndex;
      const newFare = response?.Results?.Fare;
      const pricing = fareQuote?.Pricing;

      /* ---------- Convert passengers ---------- */

      const formattedPassengers = passengers.map((p) => ({
        Title: p.title,
        FirstName: p.firstName,
        LastName: p.lastName,
        PaxType: 1,
        Gender: p.gender === "Male" ? 1 : 2,
        DateOfBirth: p.dob,
        PassportNo: p.passport || "",
        PassportExpiry: p.passportExpiry || "",
        Nationality: p.nationality || "IN",
        AddressLine1: p.address || "Delhi",
        City: p.city || "Delhi",
        CountryCode: p.country || "IN",
        ContactNo: p.phone,
        Email: p.email,
        Fare: newFare,
      }));

      const payload = {
        TraceId: newTraceId,
        ResultIndex: newResultIndex,

        Passengers: formattedPassengers,

        SeatDynamic:
          selectedSeats?.map((s) => ({
            SeatCode: s.Code,
          })) || [],

        MealDynamic: selectedMeal ? [{ Code: selectedMeal.Code }] : [],
      };
      const res = await privateApi.post("/api/airlines/book/", payload);

      navigate("/booking-success", {
        state: res.data,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <h2 className="text-xl font-bold mb-6">Review Booking</h2>

      {/* Passengers */}

      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="font-semibold mb-3">Passengers</h3>

        {passengers.map((p, i) => (
          <div key={i} className="text-sm mb-2">
            {p.title} {p.firstName} {p.lastName}
            {selectedSeats?.[i] && (
              <span className="ml-2 text-blue-600">
                Seat {selectedSeats[i].Code}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Price */}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Price Details</h3>

        <div className="flex justify-between">
          <span>Flight Fare</span>
          <span>₹{baseFare}</span>
        </div>

        {seatPrice > 0 && (
          <div className="flex justify-between">
            <span>Seat</span>
            <span>₹{seatPrice}</span>
          </div>
        )}

        {mealPrice > 0 && (
          <div className="flex justify-between">
            <span>Meal</span>
            <span>₹{mealPrice}</span>
          </div>
        )}

        <div className="border-t mt-2 pt-2 font-bold flex justify-between">
          <span>Total</span>
          <span>₹{pricing?.TotalPayable}</span>
        </div>
      </div>

      <button
        onClick={handleBook}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </div>
  );
};

export default ReviewBooking;
