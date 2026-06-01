

export const CHECK_LOGIN = "CHECK_LOGIN";

const initialState = {
    isLogin: false,
    token: null
};

const loginReducer = (state = initialState, action) =>{
    
    switch (action.type) {
        case CHECK_LOGIN:
            return {
                ...state,
                isLogin: action.status,
                token: action.token || state.token
            };
         
    
        default:
            return state;
    }

}

export default loginReducer;
