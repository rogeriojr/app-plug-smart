import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "../../store";
import { logoutUser } from "../../store/actions/users";
import { useNavigation } from "@react-navigation/native";

const renderBase = axios.create({
  // ADICIONAR SUA API
  baseURL: "https://api.plugsmart.com/",
  headers: {
    "Content-Type": "application/json",
    Authorization: "cGVnLXBhZy1hcGk6YmFzaWMtdG9rZW4=",
  },
});

// Funções auxiliares para tokens
const getAuthToken = async () => await AsyncStorage.getItem("authToken");
const getRefreshToken = async () => await AsyncStorage.getItem("refreshToken");

const refreshAuthToken = async () => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("Refresh token não encontrado.");

  try {
    // Use a mesma instância do axios para manter os headers
    const response = await renderBase.post("/login/refresh", {
      refresh_token: refreshToken,
    });

    // Atualiza storage e headers globais
    await AsyncStorage.multiSet([
      ["authToken", response.data.access_token],
      ["refreshToken", response.data.refresh_token],
    ]);

    // Atualiza header padrão
    renderBase.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${response.data.access_token}`;

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Erro ao renovar token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Interceptor de Request
renderBase.interceptors.request.use(
  async (config) => {
    const authToken = await getAuthToken();
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response
renderBase.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return renderBase(originalRequest);
      } catch (refreshError) {
        console.log("Falha no refresh, fazendo logout...");
        await AsyncStorage.multiRemove(["authToken", "refreshToken"]);

        // Dispatch seguro
        store.dispatch(logoutUser());

        // Navegação via serviço
        const navigation = useNavigation(); // Mova para dentro de um componente
        navigation.navigate("Login");

        return Promise.reject({
          error: "Sessão expirada",
          message: "Faça login novamente",
        });
      }
    }

    return Promise.reject(error);
  }
);

export default renderBase;
