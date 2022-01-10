
let init ={
    user:{},
    isAuthenticated: false,
}

const authReducer = (state=init, action)=>{
    switch (action.type) {
        case "SET_USER":
       return{
           ...state,
           user:action.payload,
           isAuthenticated: true
        }
        case "LOGOUT":
        return{
            user:{},
            isAuthenticated: false,
            }
        
        default:
            return state;
    }
}

export default authReducer