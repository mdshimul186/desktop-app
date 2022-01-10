import React from 'react'
import { useSelector } from 'react-redux'
import placeholder from '../../assets/placeholder.jpg'

function OnlineUsersList() {
    const { onlineUsers } = useSelector(state => state.chat)
    return (
        <>
            <div className="dm">
                <div className="section_title">
                    Online ({onlineUsers.length})
                </div>

                <ul className='dm_list'>
                    {
                        onlineUsers.length > 0 && onlineUsers.map((user, i) => (
                            <li onClick={() => null} key={i} className='list_item' >
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
