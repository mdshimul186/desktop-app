import axios from "axios";


export const loadChats = () => {
    return (dispatch) => {
        axios.get(process.env.REACT_APP_API_URL + '/chat/mychats')
            .then(res => {
                dispatch({
                    type: "SET_CHATS",
                    payload: res.data.chats
                })
            })
            .catch(err => {
                console.log(err);
            })

    };

}


export const loadNotifications = () => {
    return (dispatch) => {
        axios.get(process.env.REACT_APP_API_URL + '/notification/mynotifications')
            .then(res => {
                dispatch({
                    type: "SET_NOTIFICATIONS",
                    payload: res.data.notifications
                })
            })
            .catch(err => {
                console.log(err);
            })

    };

}

export const getOnlines = () => {
    return (dispatch) => {
        axios.get(process.env.REACT_APP_API_URL + '/user/online')
            .then(res => {
                dispatch({
                    type: "SET_ONLINE_USERS",
                    payload: res.data.users
                })
            })
            .catch(err => {
                console.log(err);
            })

    };

}