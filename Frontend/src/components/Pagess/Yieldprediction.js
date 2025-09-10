import { useState, useEffect } from "react";
//import axios from "axios";
import { predict } from "../../API/YieldPredictApi";
import { auth } from "../../firebase";

function Yieldprediction() {
  const [formData, setFormData] = useState({
    Soil_Temp: "",
    N: "",
    P: "",
    K: "",
    Moisture: "",
    Humidity: "",
    Air_Temp: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user || null);
    });
    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to get a prediction.");
      return;
    }

    const values = Object.values(formData);
    if (values.some((val) => val === "")) {
      setError("Please fill all the input fields before submitting.");
      return;
    }

    const numericFormData = {
      Soil_Temp: Number(formData.Soil_Temp),
      N: Number(formData.N),
      P: Number(formData.P),
      K: Number(formData.K),
      Moisture: Number(formData.Moisture),
      Humidity: Number(formData.Humidity),
      Air_Temp: Number(formData.Air_Temp),
    };

    try {
      const token = await user.getIdToken();
      const res = await predict(numericFormData, token);
      setPrediction(res.data.yield);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to get prediction. Please try again.");
    }
  };

  const handleReset = () => {
    setFormData({
      Soil_Temp: "",
      N: "",
      P: "",
      K: "",
      Moisture: "",
      Humidity: "",
      Air_Temp: "",
    });
    setPrediction(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 py-12 px-4">
      <h2 className="text-4xl font-semibold text-center text-gray-800 mb-8">
        Crop Yield Prediction
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-lg w-full max-w-lg space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <input
            type="number"
            name="Soil_Temp"
            placeholder="Soil Temperature (°C)"
            value={formData.Soil_Temp}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            name="N"
            placeholder="Nitrogen (N)"
            value={formData.N}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            name="P"
            placeholder="Phosphorus (P)"
            value={formData.P}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            name="K"
            placeholder="Potassium (K)"
            value={formData.K}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            name="Moisture"
            placeholder="Soil Moisture (%)"
            value={formData.Moisture}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            name="Humidity"
            placeholder="Air Humidity (%)"
            value={formData.Humidity}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            name="Air_Temp"
            placeholder="Air Temperature (°C)"
            value={formData.Air_Temp}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex items-center justify-between mt-6 space-x-4">
          <button
            type="submit"
            className="flex-1 bg-primary text-white py-3 rounded-md hover:bg-secondary focus:outline-none"
          >
            Predict
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-primary text-white py-3 rounded-md hover:bg-secondary focus:outline-none"
          >
            Reset
          </button>
        </div>
      </form>

      {prediction !== null && (
        <div className="mt-6 bg-white p-6 shadow-lg rounded-md w-full max-w-lg text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Crop Yield Prediction Result</h3>
          <p className="text-gray-700 text-lg">
            Based on your input parameters, the estimated yield for <span className="font-semibold">Chilli</span> is{" "}
            <span className="text-primary font-semibold text-xl">{prediction.toFixed(2)}</span> kgs per acre.
          </p>
        </div>
      )}
    </div>
  );
}

export default Yieldprediction;