import React, { useState, useEffect, useRef } from 'react'
import { Empty, Modal } from 'antd'
import axios from 'axios'
import { useSelector } from 'react-redux'
import ChatList from '../components/chat/ChatList'




function Chat() {
 
    
    const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false)
 

    const searchRef = useRef(null)



    useEffect(() => {
        if (isNewChatModalVisible) {
            searchRef?.current?.focus()
        }
    }, [isNewChatModalVisible])


    return (
        <>
            <ChatList isListPage={true}>
                <div className="chat_container list_page">
                    <div className="top_bar">
                        <div className="left">
                            Start new chat
                        </div>
                    </div>
                    <Empty
                    style={{marginTop:"10%"}}
                    description='Plase select a conversation or start new'
                    >

                    </Empty>
                   
                </div>
            </ChatList>
        </>
    )
}

export default Chat
