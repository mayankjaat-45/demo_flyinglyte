import { useLocation, useNavigate } from "react-router-dom";
import { useFlightStore } from "../../../store/flightStore";
import { privateApi, publicApi } from "../../../services/api";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../store/authStore";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearFlights } = useFlightStore();
  const { addBooking } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const booking = location.state;

  if (!booking) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Booking information not found
      </div>
    );
  }

  const itinerary = booking?.data?.Response?.Response?.FlightItinerary || {};

  const pnr = itinerary?.PNR || "N/A";
  const passenger = itinerary?.Passenger?.[0];
  const segments = itinerary?.Segments || [];
  const fare = itinerary?.Fare?.PublishedFare || 0;
  const pricing = pricing?.TotalPayable;

  const bookingId =
    booking?.data?.Response?.Response?.BookingId ||
    itinerary?.BookingId ||
    "N/A";

  const airlinePNR = itinerary?.TBOConfNo || "N/A";
  const status = segments?.[0]?.FlightStatus || "Confirmed";
  const segmentMeals = passenger?.SegmentAdditionalInfo || [];

  const formatMeal = (meal) => {
    if (!meal || meal.includes("0")) return "Not Included";
    return meal;
  };

  const bookingDate = new Date().toLocaleDateString();

  const handleHome = () => {
    clearFlights();
    navigate("/");
  };

  const handleBookingDetails = async () => {
    try {
      setLoading(true);

      const payload = {
        TraceId: booking?.data?.Response?.TraceId || booking?.data?.TraceId,

        PNR: pnr,
        BookingId: Number(bookingId),
      };

      console.log("BookingDetails Payload:", payload);

      const res = await privateApi.post(
        "/api/airlines/booking-details/",
        payload,
      );

      if (!res?.data) {
        alert("Booking details not found");
        return;
      }

      console.log("BookingDetails Response:", res.data);

      navigate("/booking-details", {
        state: res.data,
      });
    } catch (error) {
      console.error("Booking details error:", error.response?.data || error);
      alert("Unable to fetch booking details");
    } finally {
      setLoading(false);
    }
  };
  const hasSaved = useRef(false);

  useEffect(() => {
    if (!hasSaved.current && bookingId !== "N/A") {
      addBooking({
        bookingId: Number(bookingId), // ✅ FIXED key
        type: "flight", // optional but recommended
        pnr,
        airlinePNR,
        fare,
        passenger,
        segments,
        bookingDate,
        status,
      });

      hasSaved.current = true; // ✅ prevent duplicate save
    }
  }, [bookingId]);

  const handlePrintTicket = async () => {
    try {
      setLoading(true);

      const payload = {
        TraceId: booking?.data?.Response?.TraceId || booking?.data?.TraceId,

        PNR: pnr,
        BookingId: Number(bookingId),
        IsPriceChangeAccepted: false,
      };

      console.log("Ticket Payload:", payload);

      const res = await privateApi.post(
        "/api/airlines/booking/ticket/",
        payload,
      );

      if (!res?.data) {
        alert("Ticket generation failed");
        return;
      }

      console.log("Ticket Response:", res.data);

      navigate("/ticket", {
        state: res.data,
      });
    } catch (error) {
      console.error("Ticket error:", error);
      alert("Ticket API failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <div className="max-w-5xl mx-auto px-4 pt-20 space-y-6">
        {/* SUCCESS HEADER */}
        <div className="text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-600">
            Booking Confirmed
          </h1>
          <p className="text-gray-500 text-sm">
            Your flight ticket has been successfully booked
          </p>
        </div>

        {/* BOOKING DETAILS */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Booking Details</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Booking ID</p>
              <p className="font-semibold">{bookingId}</p>
            </div>

            <div>
              <p className="text-gray-500">PNR</p>
              <p className="font-semibold">{pnr}</p>
            </div>

            <div>
              <p className="text-gray-500">Airline Ref</p>
              <p className="font-semibold">{airlinePNR}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-semibold text-green-600">{status}</p>
            </div>

            <div>
              <p className="text-gray-500">Booking Date</p>
              <p className="font-semibold">{bookingDate}</p>
            </div>

            <div>
              <p className="text-gray-500">Total Fare</p>
              <p className="font-semibold text-lg">₹{pricing?.TotalPayable}</p>
            </div>
          </div>
        </div>

        {/* FLIGHT SEGMENTS */}
        {segments.map((segment, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              {/* <img
                src={`https://static.tboair.com/airline-logo/${segment?.Airline?.AirlineCode}.png`}
                className="w-9"
              /> */}
              <div>
                <p className="font-semibold text-sm">
                  {segment?.Airline?.AirlineName}
                </p>
                <p className="text-xs text-gray-500">
                  {segment?.Airline?.AirlineCode}{" "}
                  {segment?.Airline?.FlightNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xl font-bold">
                  {segment?.Origin?.Airport?.AirportCode}
                </p>
                <p className="text-xs text-gray-500">
                  {segment?.Origin?.Airport?.CityName}
                </p>
              </div>

              <div className="flex-1 px-3 border-t border-dashed relative">
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2">
                  ✈
                </span>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold">
                  {segment?.Destination?.Airport?.AirportCode}
                </p>
                <p className="text-xs text-gray-500">
                  {segment?.Destination?.Airport?.CityName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 text-center text-xs text-gray-500 gap-2">
              <p>
                Departure <br />
                <span className="text-gray-700">
                  {new Date(segment?.Origin?.DepTime).toLocaleString()}
                </span>
              </p>

              <p>
                Duration <br />
                <span className="text-gray-700">{segment?.Duration} min</span>
              </p>

              <p>
                Arrival <br />
                <span className="text-gray-700">
                  {new Date(segment?.Destination?.ArrTime).toLocaleString()}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <p>🧳 {segment?.Baggage}</p>
              <p>🎒 {segment?.CabinBaggage}</p>
              <p>🍽 {formatMeal(segmentMeals[index]?.Meal)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-3">
          <button
            onClick={handleHome}
            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold"
          >
            Back Home
          </button>

          <button
            onClick={handleBookingDetails}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Loading..." : "Booking Details"}
          </button>

          <button
            onClick={handlePrintTicket}
            disabled={loading}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold"
          >
            {loading ? "Generating..." : "Print Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
