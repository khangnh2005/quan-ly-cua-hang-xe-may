export const CHECK_ADMIN_LOGIN = "CHECK_ADMIN_LOGIN";

const initialState = {
    isAdmin: false,
    token: null
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHECK_ADMIN_LOGIN:
            return {
                ...state,
                isAdmin: action.status,
                token: action.token || state.token
            };

        default:
            return state;
    }
};

export default adminReducer;