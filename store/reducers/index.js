import { combineReducers } from "redux";
import userReducer from "./users";

// Combina todos os reducers
const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
