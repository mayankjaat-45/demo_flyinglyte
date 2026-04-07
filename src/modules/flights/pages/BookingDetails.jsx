import { useLocation, useNavigate } from "react-router-dom";

const BookingDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        No booking details found
      </div>
    );
  }

  // Debug response
  console.log("BookingDetails state:", state);

// Handle multiple API response shapes
const response =
  state?.Response ||
  state?.data?.Response ||
  state?.Response?.Response ||
  state?.data?.Response?.Response ||
  {};

const itinerary = response?.FlightItinerary || {};

const bookingId =
  response?.BookingId ||
  itinerary?.BookingId ||
  "N/A";

const airlinePNR = itinerary?.TBOConfNo || "N/A";

const passenger = itinerary?.Passenger?.[0] || null;

const segments = itinerary?.Segments?.flat?.() || [];

const fare = itinerary?.Fare?.PublishedFare || 0;

const pnr = itinerary?.PNR || "N/A";

const status = segments?.[0]?.FlightStatus || "Confirmed";

const bookingDate = new Date().toLocaleDateString();

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 py-24 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">
            Booking Details
          </h1>

          <p className="text-gray-500 text-sm">
            PNR : {pnr}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border">
  <h2 className="font-semibold text-gray-700 mb-4">
    Booking Summary
  </h2>

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
      <p className="font-semibold">₹ {fare}</p>
    </div>

  </div>
</div>

        {/* Fare */}
        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">Total Fare</p>
          <p className="text-2xl font-bold">₹ {fare}</p>
        </div>

        {/* Flight Segments */}
        {segments.length > 0 ? (
          segments.map((segment, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border p-5 space-y-4"
            >
              {/* Airline */}
              <div className="flex items-center gap-3">
                {/* <img
                  src={`https://static.tboair.com/airline-logo/${segment?.Airline?.AirlineCode}.png`}
                  className="w-8"
                  alt="airline-logo"
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

              {/* Route */}
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

              {/* Time */}
              <div className="grid grid-cols-3 text-center text-sm">
                <div>
                  <p className="text-gray-500">Departure</p>
                  <p>{formatDate(segment?.Origin?.DepTime)}</p>
                </div>

                <div>
                  <p className="text-gray-500">Duration</p>
                  <p>{segment?.Duration || "N/A"} min</p>
                </div>

                <div>
                  <p className="text-gray-500">Arrival</p>
                  <p>{formatDate(segment?.Destination?.ArrTime)}</p>
                </div>
              </div>

              {/* Baggage */}
              <div className="text-xs text-gray-600 flex gap-4">
                <p>🧳 {segment?.Baggage || "N/A"}</p>
                <p>🎒 {segment?.CabinBaggage || "N/A"}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-5 rounded-xl border text-center text-gray-500">
            No flight segments found
          </div>
        )}

        {/* Passenger */}
        {passenger && (
          <div className="bg-white p-5 rounded-xl border">
            <h3 className="font-semibold mb-3">
              Passenger
            </h3>

            <p>
            Name :-
              <span> {passenger?.Title} {passenger?.FirstName} {passenger?.LastName}</span>
            </p>

            <p className="text-sm text-gray-500 font-semibold">
              Email :- <span>{passenger?.Email || "N/A"}</span>
            </p>

            <p className="text-sm text-gray-500 font-semibold">
              Contact No :- <span>{passenger?.ContactNo || "N/A"}</span>
            </p>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="fixed bottom-0 w-full bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;