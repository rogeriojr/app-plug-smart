import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rootReducer from "./reducers";

// Configuração de persistência
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"], // Apenas persiste o reducer 'user'
};

// Cria reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware customizado para verificação de autenticação
const authMiddleware = (store) => (next) => async (action) => {
  // Lista de ações que requerem token válido
  const protectedActions = [
    "USER_UPDATE",
    "USER_SETTINGS_UPDATE_LANGUAGE",
    "USER_SETTINGS_UPDATE_ROLE",
    "USER_SETTINGS_UPDATE_TOKEN",
  ];

  if (protectedActions.includes(action.type)) {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        store.dispatch({ type: "LOGOUT_USER" });
      }
    } catch (error) {
      console.error("Erro na verificação do token:", error);
    }
  }

  return next(action);
};

// Cria a store com configurações
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Desativa verificação para objetos complexos
    }).concat(authMiddleware),
});

// Cria o persistor para a store
export const persistor = persistStore(store);
