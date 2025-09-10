import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { FaSeedling, FaAppleAlt, FaCarrot } from "react-icons/fa";

function CropRecommendation() {
  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    Temp: "",
    Humidity: "",
  });

  const [recommendation, setRecommendation] = useState(null);
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
      setError("You must be logged in to get recommendations.");
      return;
    }

    const values = Object.values(formData);
    if (values.some((val) => val === "")) {
      setError("Please fill all the input fields before submitting.");
      return;
    }

    const numericFormData = {
      N: Number(formData.N),
      P: Number(formData.P),
      K: Number(formData.K),
      temperature: Number(formData.Temp),
      humidity: Number(formData.Humidity),
    };

    try {
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5001/predict_crop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(numericFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch crop prediction.");
      }

      const result = await response.json();
      setRecommendation(result.predictions);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to get recommendation. Please try again.");
    }
  };

  const handleReset = () => {
    setFormData({
      N: "",
      P: "",
      K: "",
      Temp: "",
      Humidity: "",
    });
    setRecommendation(null);
    setError("");
  };

  const renderCropIcon = (crop) => {
    switch (crop.toLowerCase()) {
      case "wheat":
        return <FaSeedling className="text-2xl text-green-500" />;
      case "rice":
        return <FaAppleAlt className="text-2xl text-red-500" />;
      case "maize":
        return <FaCarrot className="text-2xl text-orange-500" />;
      default:
        return <FaSeedling className="text-2xl text-gray-500" />;
    }
  };

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 py-12 px-4">
      <h2 className="text-4xl font-semibold text-center text-gray-800 mb-8">
        Crop Recommendation
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-lg w-full max-w-lg space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          {["N", "P", "K", "Temp", "Humidity"].map((field) => (
            <input
              key={field}
              type="number"
              name={field}
              placeholder={
                field === "Temp"
                  ? "Temperature (°C)"
                  : field === "Humidity"
                  ? "Humidity (%)"
                  : `${field} value`
              }
              value={formData[field]}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          ))}
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex items-center justify-between mt-6 space-x-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md shadow"
          >
            Get Recommendation
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md shadow"
          >
            Reset
          </button>
        </div>
      </form>

      {recommendation && (
        <div className="mt-8 bg-white p-6 shadow-md rounded-md w-full max-w-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Based on your input values, we recommend the following crops:
          </h3>
          <div className="space-y-3">
            {recommendation.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-start space-x-4 border p-3 rounded-md shadow-sm"
              >
                {renderCropIcon(item.crop)}
                <p className="text-lg font-medium text-gray-700">
                  {capitalize(item.crop)} –{" "}
                  <span className="font-semibold text-blue-600">
                    {item.probability.toFixed(2)}%
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CropRecommendation;