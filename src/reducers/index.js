import {combineReducers} from "redux"
import loginReducer from "./login";
import adminReducer from "./admin";

const allReducers = combineReducers({
    loginReducer,
    adminReducer
    
    // Them nhieu reducer vao day
});

export default allReducers;
