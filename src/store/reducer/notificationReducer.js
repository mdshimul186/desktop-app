
let init ={
    notifications:[],
 
}

const notificationReducer = (state=init, action)=>{
    switch (action.type) {
        case "SET_NOTIFICATIONS":
       return{
           ...state,
           notifications:action.payload,
        }
    
        case "NEW_NOTIFICATION":
       return{
           ...state,
           notifications:[action.payload,...state.notifications],
        }
        case "UPDATE_NOTIFICATION":
            let array = [...state.notifications]
            let index = array.findIndex(n=>n._id === action.payload._id)
            array[index] = action.payload
       return{
           ...state,
           notifications:array,
        }
    
        default:
            return state;
    }
}

export default notificationReducer