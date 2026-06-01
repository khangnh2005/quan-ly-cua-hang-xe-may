export const checkAdminLogin = (status, token = null) => {
    return {
        type: "CHECK_ADMIN_LOGIN",
        status: status,
        token: token
    };
};