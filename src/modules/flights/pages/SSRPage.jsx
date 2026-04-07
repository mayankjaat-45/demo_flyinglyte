import { useEffect, useState } from "react";
import { privateApi } from "../../../services/api";
import { useFlightStore } from "../../../store/flightStore";
import { useNavigate } from "react-router-dom";

const SSRPage = () => {
  const {
    traceId,
    resultIndex,
    selectedMeal,
    selectedSeats,
    passengerCount,
    setSelectedMeal,
    setSelectedSeats,
  } = useFlightStore();

  const [meals, setMeals] = useState([]);
  const [seatRows, setSeatRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* ---------------- Session Guard ---------------- */

  useEffect(() => {
    if (!traceId || !resultIndex) {
      navigate("/");
    }
  }, [traceId, resultIndex, navigate]);

  /* ---------------- Seat Click ---------------- */

  const handleSeatClick = (seat) => {
    const exists = selectedSeats.find((s) => s.Code === seat.Code);

    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.Code !== seat.Code));
      return;
    }

    if (selectedSeats.length >= passengerCount) {
      alert(`You can select only ${passengerCount} seats`);
      return;
    }

    setSelectedSeats([...selectedSeats, seat]);
  };

  /* ---------------- Seat Renderer ---------------- */

  const renderSeat = (seat) => {
    const unavailable = seat.AvailablityType !== 1;

    const isSelected = selectedSeats.some((s) => s.Code === seat.Code);

    const price = seat?.Price || 0;

    return (
      <button
        key={seat.Code}
        disabled={unavailable}
        onClick={() => handleSeatClick(seat)}
        className={`w-12 h-12 rounded-md text-[10px] flex flex-col justify-center items-center border transition

        ${
          unavailable
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : isSelected
              ? "bg-green-600 text-white border-green-600"
              : price > 0
                ? "bg-yellow-400 text-black"
                : "bg-white hover:bg-gray-100"
        }
        `}
      >
        <span className="font-semibold">{seat.Code}</span>

        {price > 0 && <span className="text-[9px]">₹{price}</span>}
      </button>
    );
  };

  /* ---------------- Fetch SSR ---------------- */

  const fetchSSR = async () => {
    if (!traceId || !resultIndex) return;

    try {
      setLoading(true);

      const res = await privateApi.post("/api/airlines/ssr/", {
        TraceId: traceId,
        ResultIndex: resultIndex,
      });

      const response = res?.data?.Response;

      /* ---------- Meals ---------- */

      setMeals(response?.Meal || []);

      /* ---------- Seats ---------- */

      const rows = response?.SeatDynamic?.[0]?.SegmentSeat?.[0]?.RowSeats || [];

      const parsedRows = rows.map((row) => row.Seats || []);

      setSeatRows(parsedRows);
    } catch (err) {
      console.error("SSR fetch error:", err);
      setError("Failed to load SSR data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSSR();
  }, [traceId, resultIndex]);

  /* ---------------- Loading ---------------- */

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse text-lg">
          Loading Add-ons...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );

  if (!traceId || !resultIndex) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-24">
      {/* Title */}

      <h2 className="text-xl md:text-2xl font-bold mb-8">Select Add-ons</h2>

      {/* ---------------- Meals ---------------- */}

      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Meals</h3>

        {meals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {meals.map((meal) => (
              <button
                key={meal.Code}
                onClick={() => setSelectedMeal(meal)}
                className={`border rounded-lg p-3 text-sm text-left transition

                ${
                  selectedMeal?.Code === meal.Code
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100"
                }
                `}
              >
                <p className="font-medium">{meal.Description}</p>

                {meal.Price > 0 && (
                  <p className="text-xs opacity-80 mt-1">₹{meal.Price}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No meals available.</p>
        )}
      </div>

      {/* ---------------- Seats ---------------- */}

      <div>
        <h3 className="text-lg font-semibold mb-2">Seat Selection</h3>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Seats Selected: {selectedSeats.length} / {passengerCount}
        </p>

        {seatRows.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-162.5 flex flex-col items-center">
              {seatRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <div className="w-8 text-xs text-gray-500 text-right">
                    {i + 1}
                  </div>

                  {/* Left seats */}
                  <div className="flex gap-2">
                    {row.slice(0, 3).map(renderSeat)}
                  </div>

                  {/* aisle */}
                  <div className="w-6"></div>

                  {/* Right seats */}
                  <div className="flex gap-2">
                    {row.slice(3).map(renderSeat)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No seats available</p>
        )}
      </div>

      {/* ---------------- Selected Summary ---------------- */}

      {(selectedMeal || selectedSeats.length > 0) && (
        <div className="mt-10 p-5 border rounded-lg bg-gray-50 text-sm">
          <h4 className="font-semibold mb-2">Selected Add-ons</h4>

          {selectedMeal && <p>🍽 Meal: {selectedMeal.Description}</p>}

          {selectedSeats.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">💺 Seats:</p>

              {selectedSeats.map((seat) => (
                <p key={seat.Code}>
                  {seat.Code} (₹{seat.Price || 0})
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Continue ---------------- */}

      <div className="sticky bottom-0 bg-white pt-6 mt-10 border-t">
        <button
          disabled={selectedSeats.length !== passengerCount}
          onClick={() => navigate("/passenger-details")}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700
          disabled:bg-gray-300 text-white px-6 py-3 rounded-lg
          font-medium transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SSRPage;
