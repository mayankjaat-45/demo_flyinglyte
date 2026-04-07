"use client";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { privateApi } from "../../../services/api";
import { cancelHotelBooking } from "../../../services/cancelHotelBooking";

const HotelBookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [guestDetails, setGuestDetails] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelData, setCancelData] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  /* ================= 🔥 VERIFY PAYMENT ================= */
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const query = new URLSearchParams(location.search);

        const txnid = query.get("txnid");

        if (!txnid) throw new Error("Transaction ID missing");

        const res = await privateApi.get("/payments/success/", {
          params: { txnid },
        });

        const data = res.data;

        // ✅ booking from backend
        setBooking(data.booking);

        // ✅ restore from localStorage (fallback)
        const saved = JSON.parse(
          localStorage.getItem("hotelBookingData") || "{}",
        );

        setHotel(saved.hotel);
        setGuestDetails(saved.guestList || []);
      } catch (err) {
        console.error("VERIFY ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  /* ================= CANCEL ================= */
  const handleCancelBooking = async () => {
    const confirmCancel = window.confirm("Are you sure?");
    if (!confirmCancel) return;

    try {
      setCancelLoading(true);
      setCancelError(null);

      const res = await cancelHotelBooking(booking.BookingId);

      if (res?.success) {
        setCancelData(res.data);
      } else if (res?.RefundedAmount) {
        setCancelData(res);
      } else {
        setCancelError(res?.message || "Cancellation failed");
      }
    } catch (err) {
      setCancelError("Something went wrong");
    } finally {
      setCancelLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="text-white text-center py-24">Verifying payment...</div>
    );
  }

  /* ================= NO BOOKING ================= */
  if (!booking) {
    return (
      <div className="p-10 py-26 text-center text-white bg-[#0B0B0F] min-h-screen">
        <h2 className="text-xl text-red-400 mb-4">⚠️ Booking not found</h2>

        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-yellow-400 text-black rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-10 py-26">
      {/* SUCCESS HEADER */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-5 animate-pulse">
          <span className="text-5xl">✅</span>
        </div>

        <h1 className="text-3xl font-bold text-green-400">
          Booking Confirmed!
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* HOTEL */}
          <div className="bg-[#15151C] p-6 rounded-3xl border border-gray-800">
            <h2 className="text-xl text-yellow-400">{hotel?.hotel_name}</h2>

            <div className="text-sm text-gray-400 mt-3 space-y-1">
              <p>🏨 Booking ID: {booking.BookingId}</p>
              <p>📄 Invoice: {booking.InvoiceNumber}</p>
              <p>🔖 Ref: {booking.BookingRefNo}</p>
              <p>🔐 Confirmation: {booking.ConfirmationNo}</p>
            </div>
          </div>

          {/* GUESTS */}
          {guestDetails?.length > 0 && (
            <div className="bg-[#15151C] p-6 rounded-3xl border border-gray-800">
              <h3 className="text-yellow-300 mb-3">Guests</h3>

              {guestDetails.map((g, i) => (
                <div key={i} className="text-sm py-1">
                  {g.FirstName} {g.LastName}
                </div>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate(`/booking-details/${booking.BookingId}`)}
              className="px-5 py-2 bg-blue-500 rounded-lg"
            >
              View Details
            </button>

            <button
              onClick={handleCancelBooking}
              className="px-5 py-2 bg-red-500 rounded-lg"
            >
              Cancel Booking
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#15151C] p-6 rounded-3xl border border-gray-800">
          <h3 className="text-yellow-300 mb-4">Payment</h3>

          <p>₹ {Math.round(booking?.NetAmount || 0)}</p>
          <p className="text-green-400">Success</p>
        </div>
      </div>

      {/* CANCEL RESULT */}
      {cancelData && (
        <div className="mt-6 text-green-400">
          Refunded ₹ {cancelData.RefundedAmount}
        </div>
      )}
    </div>
  );
};

export default HotelBookingSuccess;
