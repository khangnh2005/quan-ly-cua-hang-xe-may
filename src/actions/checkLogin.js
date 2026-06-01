export const checkLogin =(status, token = null)=>{
    return(
        {
           type:"CHECK_LOGIN",
            status: status,
            token: token     
        }
        
    )
}