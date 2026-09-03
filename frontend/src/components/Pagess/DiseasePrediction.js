import { useState, useRef } from "react";
import { predictDisease } from "../../API/DIseasePredictApi";
import { FiUploadCloud } from "react-icons/fi";
import { FaSearch, FaRedo } from "react-icons/fa";

// Remedies and healthy message
const diseaseRemedies = {
  "leaf curl": `• Remove and destroy infected plants to prevent spread.
• Control aphids and thrips with neem oil or insecticidal soap.
• Use virus-free seeds and resistant varieties.`,

  "leaf spot": `• Remove affected leaves and avoid overhead watering.
• Apply copper-based fungicide as per instructions.
• Improve air circulation around plants.`,

  "whitefly": `• Spray neem oil or insecticidal soap regularly.
• Use yellow sticky traps to catch adult whiteflies.
• Introduce natural predators like ladybugs.`,

  "yellowish": `• Ensure proper drainage and avoid overwatering.
• Apply balanced fertilizers (NPK) based on soil testing.
• Check for nutrient deficiencies, especially iron and nitrogen.`,

  "healthy": `🎉 Great job! Your chilli plant looks healthy and thriving.
• Keep up the consistent watering schedule.
• Maintain good air circulation and sunlight.
• Watch for early signs of pests or discoloration to stay ahead.`,
};

const DiseasePrediction = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
    }
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();

    if (!image) {
      fileInputRef.current.click();
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await predictDisease(image);
      setPrediction(response.data);
    } catch (err) {
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-12 px-4">
      <h2 className="text-4xl font-semibold text-center text-gray-800 mb-8">
        Disease Prediction
      </h2>

      <form
        className="bg-white p-8 shadow-lg rounded-lg w-full max-w-lg space-y-6"
        onSubmit={handleButtonClick}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="mx-auto max-h-60 rounded-lg border"
          />
        )}

        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-md transition duration-300 shadow-md text-white 
            ${image ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
          `}
          disabled={loading}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              {image ? (
                <>
                  <FaSearch className="text-lg" />
                  Predict
                </>
              ) : (
                <>
                  <FiUploadCloud className="text-lg" />
                  Upload Image
                </>
              )}
            </>
          )}
        </button>
      </form>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {prediction && (
        <div className="mt-6 bg-white p-6 shadow-xl rounded-lg w-full max-w-lg text-left space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">
            Prediction Result
          </h3>

          <div className="text-lg">
            <span className="font-semibold text-gray-700">Predicted Class:</span>{" "}
            <span className="text-green-700 font-bold capitalize">
              {prediction.predicted_class}
            </span>
          </div>

          <div>
            <h4
              className={`text-lg font-semibold mt-4 mb-2 ${
                prediction.predicted_class === "healthy"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {prediction.predicted_class === "healthy"
                ? "Great News!"
                : "Recommended Remedy:"}
            </h4>
            <p
              className={`text-gray-700 whitespace-pre-line leading-relaxed border-l-4 pl-4 italic ${
                prediction.predicted_class === "healthy"
                  ? "border-green-300"
                  : "border-red-300"
              }`}
            >
              {diseaseRemedies[prediction.predicted_class]}
            </p>
          </div>
        </div>
      )}

      {(image || prediction || error) && (
        <button
          onClick={handleReset}
          className="mt-6 text-sm text-gray-600 underline hover:text-gray-800 flex items-center gap-2"
        >
          <FaRedo />
          Reset
        </button>
      )}
    </div>
  );
};

export default DiseasePrediction;