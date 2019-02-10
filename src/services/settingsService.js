import axios from "axios";

// CONSTANTS
import { BASE_URL, API_HEADER, HEADER_RESPONSE } from "../constants/apiBaseUrl";

// ERROS
import { internalServerError } from "../containers/errors/statusCodeMessage";

// UTILS
import { setAuthToken } from "../utils/localStorage";

class SettingsService {
  async kycCreate(token, payload) {
    try {
      API_HEADER.headers.Authorization = token;
      const response = await axios.post(
        `${BASE_URL}/kyc`,
        payload.payload,
        API_HEADER
      );
      setAuthToken(response.headers[HEADER_RESPONSE]);
      return response.data;
    } catch (error) {
      internalServerError();
      return;
    }
  }

  async kycUpload(token, payload) {
    try {
      API_HEADER.headers.Authorization = token;
      const response = await axios.post(
        `${BASE_URL}/kyc/upload`,
        payload.upload,
        API_HEADER
      );

      setAuthToken(response.headers[HEADER_RESPONSE]);
      return response.data;
    } catch (error) {
      internalServerError();
      return;
    }
  }
}

export default SettingsService;