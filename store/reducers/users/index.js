import { USER_UPDATE, USER_RESET, LOGOUT_USER } from "../../actions"; // Importe diretamente do actions

import AsyncStorage from "@react-native-async-storage/async-storage";

// Estado inicial do usuário
const initialState = {
  usuario: null,
  authToken: null,
  refreshToken: null,
};
// Reducer principal
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_UPDATE:
      return {
        ...state,
        ...action.payload,
        usuario: {
          ...state.usuario,
          ...action.payload.usuario,
        },
      };

    case LOGOUT_USER:
      return initialState;

    default:
      return state;
  }
};

export default reducer;
