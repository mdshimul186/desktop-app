import React, { useState, useRef,useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useSelector } from 'react-redux'
import Message from './Message';
import { Upload, Divider, notification } from 'antd'
import axios from 'axios'
import QuillEditor from './TextQuill'

function Thread({ chat, message, handleUpdateMessage, removeThread }) {

    const [text, setText] = useState("")
    const { user: profile } = useSelector(state => state.auth)
    const findUser = (users) => {
        let otherUser = users?.filter(u => u._id !== profile._id)[0]
        return otherUser
    }

    let uploadRef = useRef()
    let lastmsgref = useRef()
    let handleKey = (e,isOpenMention) => {
       
        if (e.keyCode === 13 && !e.shiftKey && !isOpenMention) {
            return sendMessage()
        }
    }
    const sendMessage = () => {
        let data = {
            content: text.replaceAll("<p><br></p>", "")
        }
        setText("")
        axios.post(`/chat/sendreply/${message._id}`, data)
            .then(res => {
                //console.log(res.data.message);
               
                handleUpdateMessage(res.data.message)
            })
            .catch(err => {
                console.log(err);
                notification.error({ message: err?.response?.data?.error })
            })
    }

     useEffect(() => {
        if (lastmsgref.current) {
            lastmsgref.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest"
            })
        }
    })

    return (
        <div className='thread'>
            <div className="top_bar">
                <div className="left">
                    <span>
                        Thread
                    </span>
                    <span className='channel_name' style={{ marginLeft: "10px", fontSize: "13px", color: "#999999" }}>
                        {chat && chat.isChannel ? <span onClick={() => null} >{`# ${chat.name}`}</span> : findUser(chat.users)?.fullName}

                    </span>
                    <span onClick={removeThread} style={{ marginLeft: "auto", color: "red", cursor: "pointer" }}>
                        <AiOutlineClose />
                    </span>


                </div>
            </div>
            <div className="message_wapper">
                <ul className='list_wrapper'>
                    <Message
                        isThread
                        //lastmessage={null}
                        //ref={lastmessage ? lastmsgref : null} 
                        //key={index}
                        message={message}
                    //handleUpdateMessage={(message) => handleUpdateMessage(message)}
                    />
                </ul>

                <Divider orientation='left'>{message?.replies?.length || 0} replies</Divider>
                <ul className='list_wrapper'>
                    {
                        message?.replies &&
                        message?.replies.map((message, index) => {
                            const lastmessage = message?.replies?.length - 1 === index
                            return (
                                <Message
                                    isThread
                                    //setThreadMessage={setThreadMessage}
                                    lastmessage={lastmessage}
                                    ref={lastmessage ? lastmsgref : null} 
                                    key={index}
                                    message={message}
                                //handleUpdateMessage={(message) => handleUpdateMessage(message)}
                                />
                            )

                        }
                        )
                    }

                </ul>
            </div>




            <div className="input_wrapper">
                {/* <Upload
                    showUploadList={{ showPreviewIcon: false }}
                    maxCount={8}
                    listType="picture"
                    multiple
                    fileList={[]}
                    // customRequest={uploadImage}
                    //onChange={handleChange}
                    className='antd_upload_files'
                >
                    <button style={{ display: "none" }} ref={uploadRef} ></button>
                </Upload> */}
                <QuillEditor
                    source="thread"
                    className="toolbar2"
                    onKeyDown={handleKey}
                    text={text}
                    handleChange={val => setText(val)}
                    sendText={() => sendMessage()}
                    users={chat?.users}
                    onUploadClick={() => uploadRef.current.click()}
                />
                {/* <textarea value={text} onChange={e => setText(e.target.value)} /> */}
            </div>


        </div>
    );
}

export default Thread;
