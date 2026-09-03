import axios from "axios";
import { API_URL } from "./config";

export const predictDisease = async (image) => {
    const formData = new FormData();
    formData.append("file", image);

    return axios.post(`${API_URL}/predict_disease`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
