"use client";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { privateApi } from "../../../services/api";
import { useHotelStore } from "../../../store/hotelStore";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookingData } = useHotelStore();
  const { state } = useLocation();

  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(!state?.booking);
  const [error, setError] = useState(null);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!bookingId) return;

    const fetchDetails = async () => {
      try {
        const res = await privateApi.post(
          "/api/hotels/hotel/get-booking-detail/",
          { BookingId: Number(bookingId) },
        );

        if (res?.data?.success && res?.data?.data) {
          setBooking(res.data.data);
          return;
        }

        throw new Error("API failed");
      } catch (err) {
        if (state?.booking) setBooking(state.booking);
        else if (bookingData?.BookingId === Number(bookingId))
          setBooking(bookingData);
        else setError("Booking not found");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [bookingId]);

  if (loading)
    return <div className="text-white text-center py-20">Loading...</div>;

  if (error)
    return <div className="text-red-400 text-center py-20">{error}</div>;

  if (!booking) return null;

  const isCancelled = booking?.HotelBookingStatus === "Cancelled";
  const room = booking?.Rooms?.[0];
  const refund = booking?.CancellationStatus?.[0];

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-10 py-20">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-yellow-400">Booking Details</h1>

        <div className="mt-3 text-sm text-gray-400 space-y-1">
          <p>Booking ID: {booking?.BookingId}</p>
          <p>Ref No: {booking?.BookingRefNo}</p>
          <p>Confirmation: {booking?.ConfirmationNo}</p>
          <p>Booked On: {formatDate(booking?.BookingDate)}</p>
        </div>
      </div>

      {/* HOTEL */}
      <div className="bg-[#15151C] p-6 rounded-2xl mb-6">
        <h2 className="text-lg font-semibold">
          {booking?.HotelName} ⭐ {booking?.StarRating}
        </h2>

        <p className="text-gray-400 text-sm">
          {booking?.AddressLine1}, {booking?.City}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <p>Check-in: {formatDate(booking?.CheckInDate)}</p>
          <p>Check-out: {formatDate(booking?.CheckOutDate)}</p>
          <p>Rooms: {booking?.NoOfRooms}</p>
          <p>Room Type: {room?.RoomTypeName}</p>
        </div>
      </div>

      {/* STATUS */}
      <div className="bg-[#15151C] p-6 rounded-2xl mb-6">
        <div className="flex justify-between">
          <span>Status</span>
          <span className={isCancelled ? "text-red-400" : "text-green-400"}>
            {booking?.HotelBookingStatus}
          </span>
        </div>

        <div className="flex justify-between mt-2">
          <span>Voucher</span>
          <span>{booking?.VoucherStatus ? "Available" : "Pending"}</span>
        </div>

        {isCancelled && (
          <p className="text-red-400 text-sm mt-2">Booking cancelled</p>
        )}
      </div>

      {/* GUESTS */}
      <div className="bg-[#15151C] p-6 rounded-2xl mb-6">
        <h3 className="mb-3 text-yellow-300">Guests</h3>

        {room?.HotelPassenger?.map((g, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>
              {g.Title} {g.FirstName} {g.LastName}
            </span>
            {g.LeadPassenger && (
              <span className="text-yellow-400 text-xs">Lead</span>
            )}
          </div>
        ))}
      </div>

      {/* PAYMENT */}
      <div className="bg-[#15151C] p-6 rounded-2xl mb-6">
        <h3 className="mb-3 text-yellow-300">Payment</h3>

        <div className="flex justify-between">
          <span>Total Paid</span>
          <span className="text-green-400">
            ₹ {Math.round(booking?.NetAmount || 0)}
          </span>
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span>Tax</span>
          <span>₹ {Math.round(booking?.NetTax || 0)}</span>
        </div>
      </div>

      {/* REFUND */}
      {isCancelled && refund && (
        <div className="bg-[#15151C] p-6 rounded-2xl mb-6">
          <h3 className="text-red-400 mb-3">Refund</h3>

          <p>Amount: ₹ {Math.round(refund?.RefundAmount || 0)}</p>
          <p>Credit Note: {refund?.CreditNoteNo}</p>
          <p>Date: {formatDate(booking?.CreditNoteCreatedOn)}</p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-800 rounded-lg"
        >
          Print
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default BookingDetails;
