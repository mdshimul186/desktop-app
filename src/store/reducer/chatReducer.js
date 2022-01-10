
let init = {
    chats: [],
    onlineUsers: [],

}

const authReducer = (state = init, action) => {
    switch (action.type) {
        case "SET_CHATS":
            return {
                ...state,
                chats: action.payload,
            }
        case "UPDATE_CHATS":
            let array = [...state.chats]
            let index = array.findIndex((chat) => chat._id === action.payload._id)
            if (index === -1) {
                array.unshift(action.payload)
            } else {
                array[index] = action.payload
            }

            return {
                ...state,
                chats: array,
            }
        case "ADD_CHAT":
            let temparray = [...state.chats]
            let tempindex = temparray.findIndex((chat) => chat._id === action.payload._id)
            if (tempindex === -1) {
                temparray.unshift(action.payload)
            }
            return {
                ...state,
                chats: temparray,
            }
        case "UPDATE_LATEST_MESSAGE":
            let temparray2 = [...state.chats]
            let tempindex2 = temparray2.findIndex((chat) => chat._id === action.payload.chatId)
            temparray2[tempindex2] = { ...temparray2[tempindex2], latestMessage: action.payload.latestMessage, toRead: [] }
            return {
                ...state,
                chats: temparray2,
            }
        case "MARK_READ":
            let temparray3 = [...state.chats]
            let tempindex3 = temparray3.findIndex((chat) => chat._id === action.payload)
            temparray3[tempindex3] = { ...temparray3[tempindex3], toRead: [] }
            return {
                ...state,
                chats: temparray3,
            }


        case "SET_ONLINE_USERS":
            return {
                ...state,
                onlineUsers: action.payload,
            }
        case "ADD_ONLINE_USER":
            let onlineArray = [...state.onlineUsers]
            let onlineUserIndex = onlineArray.findIndex((user) => user._id === action.payload._id)
            if (onlineUserIndex === -1) {
                onlineArray.unshift(action.payload)
            }
            return {
                ...state,
                onlineUsers: onlineArray,
            }
        case "REMOVE_ONLINE_USER":
            let temparrayOnline = [...state.onlineUsers]
            let filtered = temparrayOnline.filter((user) => user._id !== action.payload?._id)
           
            return {
                ...state,
                onlineUsers: filtered,
            }


        default:
            return state;
    }
}

export default authReducer