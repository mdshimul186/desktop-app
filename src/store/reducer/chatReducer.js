
let init = {
    chats: [],
    onlineUsers: [],
    chatMessages: {}

}

function htmlToStr(text) {
    return text.replace(/<[^>]*>?/gm, '')
}

const handleChatNoti=(chat)=>{
    window.electron.notificationApi.sendNotification(
      {
        title: chat.isChannel ? chat.name + ": " + chat?.latestMessage?.sender?.fullName : chat?.latestMessage?.sender?.fullName,
        body:htmlToStr(chat.latestMessage?.content)
      }
        )
  }

const chatReducer = (state = init, action) => {
    switch (action.type) {
        case "SET_CHATS":
           
            return {
                ...state,
                chats: action.payload,
            }
        case "UPDATE_CHATS":
            handleChatNoti(action.payload)
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

        case "UPDATE_CHAT_MESSAGES":
            //console.log(action.payload);
            return {
                ...state,
                chatMessages: { ...state.chatMessages, [action.payload.chat]: action.payload.messages },
            }
        case "PUSH_MESSAGE":
            let allChatMessages = state.chatMessages
            let messagesArray = allChatMessages[action.payload.chat]
            messagesArray.push(action.payload.message)
            let finalArray = messagesArray.slice((messagesArray.length - 30), messagesArray.length)
            return {
                ...state,
                chatMessages: { ...state.chatMessages, [action.payload.chat]: finalArray },
            }


        case "UPDATE_MESSAGE":
           
            let allChatMessages_U = state.chatMessages
            let messagesArray_U = allChatMessages_U[action.payload.chat]

            let messagesArray_U_index = messagesArray_U.findIndex(m => m._id === action.payload.message._id)



            if (messagesArray_U_index !== -1) {
                messagesArray_U[messagesArray_U_index] = { ...messagesArray_U[messagesArray_U_index], ...action.payload.message }
            }

            //console.log(messagesArray_U[]);
            return {
                ...state,
                chatMessages: { ...state.chatMessages, [action.payload.chat]: messagesArray_U },
            }


        default:
            return state;
    }
}

export default chatReducer