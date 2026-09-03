import axios from "axios";
import { API_URL } from "./config";

export const predict = async (data, token) => {
    return axios.post(`${API_URL}/predict_crop`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};