import React from 'react'
import { useSelector,useDispatch } from 'react-redux'
import placeholder from '../../assets/placeholder.jpg'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { message } from 'antd'
function OnlineUsersList() {
    const {chats, onlineUsers } = useSelector(state => state.chat)
    const Router = useHistory()
    let dispatch = useDispatch()

    const handleStartConversation=(id)=>{
        axios.post(`/chat/findorcreate/${id}`)
        .then(res => {
            let filtered = chats.filter(c => c._id === res.data.chat._id)

            //console.log(chats,id);
            if (filtered.length > 0) {
                Router.push(`/chat/${res.data.chat._id}`)
            } else {
                dispatch({
                    type: "UPDATE_CHATS",
                    payload: res.data.chat
                })
                Router.push(`/chat/${res.data.chat._id}`)
            }

        })
        .catch(err => {
            console.log(err);
            message.error('something went wrong')
        })
    }
    return (
        <>
            <div className="dm">
                <div className="section_title">
                    Online ({onlineUsers.length})
                </div>

                <ul className='dm_list'>
                    {
                        onlineUsers.length > 0 && onlineUsers.map((user, i) => (
                            <li onClick={() => handleStartConversation(user._id)} key={i} className='list_item' >
                                <div className="img">
                                    <img src={user.profilePicture || placeholder} alt="" />
                                    <div className="bubble">
                                        <span className="bubble-outer-dot">
                                            <span className="bubble-inner-dot"></span>
                                        </span>
                                    </div>
                                </div>
                                <div className='info'>
                                    <span className='name'>
                                        {user.fullName || "N/A"}
                                    </span>
                                    <p style={{ fontSize: "12px", color: "#ddd" }}>
                                        {
                                            user.email
                                        }
                                    </p>
                                </div>

                            </li>
                        ))
                    }


                </ul>
            </div>
        </>
    )
}

export default OnlineUsersList
