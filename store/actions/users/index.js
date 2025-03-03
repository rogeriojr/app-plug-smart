// actions/userActions.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_UPDATE, USER_RESET, LOGOUT_USER } from "../index";

// Ação de logout corrigida
export const logoutUser = () => {
  return async (dispatch) => {
    try {
      await AsyncStorage.multiRemove(["authToken", "refreshToken"]);
      dispatch({ type: LOGOUT_USER });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
};

// Restante das ações...
export const updateUser = (payload) => ({
  type: USER_UPDATE,
  payload,
});

export const resetUser = () => ({
  type: USER_RESET,
});
