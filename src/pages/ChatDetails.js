import React, { useState, useEffect, useRef, useCallback } from 'react'
import ChatList from '../components/chat/ChatList'
import { useParams } from 'react-router-dom'
import { socket } from '../helper/withAuth'
import { useSelector, useDispatch } from 'react-redux'
import { Avatar, Empty, message, Result, Spin, Upload } from 'antd';
import axios from 'axios'
import { IoMdSend, IoIosAttach } from 'react-icons/io'
import { FaAngleDown, FaDownload } from 'react-icons/fa'
import ChannelDetailsModal from '../components/chat/ChannelDetailsModal'
import Message from '../components/chat/Message'
import ReactQuill from 'react-quill'
import placeholder from '../assets/placeholder.jpg'


const modules = {
    // #3 Add "image" to the toolbar
    //toolbar: TOOLBAR_OPTIONS,
    toolbar: {
        container: "#toolbar",
        // handlers: {
        //   undo: undoChange,
        //   redo: redoChange
        // }
    }
};

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    //"link",
    "image",
    "code-block"
    //"imageBlot" // #5 Optinal if using custom formats
];
function ChatDetails() {
    const { user: profile } = useSelector(state => state.auth)
    const { chatMessages } = useSelector(state => state.chat)
    const { chats } = useSelector(state => state.chat)
    const dispatch = useDispatch()
    let params = useParams()
    let uploadRef = useRef()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isFetching, setIsFetching] = useState(false)

    const [messages, setMessages] = useState([])
    const [messagesPending, setMessagesPending] = useState([])
    const [chat, setChat] = useState(null)
    const [text, setText] = useState("")
    const [isTyping, setisTyping] = useState(false)
    const [files, setFiles] = useState([])

    const [isSendingImage, setIsSendingImage] = useState(false)
    const [isSendingText, setIsSendingText] = useState(false)
    const [count, setCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false)

    useEffect(() => {
        if (chats && params.chatid) {
            setChat(chats.filter(chat => chat._id === params.chatid)[0])
        }
    }, [chats, params])

    useEffect(() => {
        if (socket) {
            socket.on("receive", data => {
                if (data?.message?.activity?.type === 'remove' && data?.message?.activity?.user?._id === profile._id) {
                    socket.off('receive');
                    socket.off('istyping');
                }
                // setMessages(prev => [...prev, data.message])
                dispatch({
                    type:"PUSH_MESSAGE",
                    payload: {chat:data.chat,message:data.message}
                })
                //console.log(data);
            })
            socket.on("istyping", data => {
                setisTyping(data.istyping)
            })

            socket.on("receive-update-chat", data => {
                setChat((prev) => ({ ...prev, ...data.chat }))
            })
            socket.on("receive-update-message", data => {
                dispatch({
                    type:"UPDATE_MESSAGE",
                    payload:{chat:data.chat,message:data.message}
                })
            })
            return () => {
                socket.off('receive');
                socket.off('istyping');
                socket.off('receive-update-chat');
                socket.off('receive-update-message');

            }
        }


    }, [socket])

    var typing = false;
    var timeout = undefined;

    function timeoutFunction() {
        typing = false;
        socket.emit("typing", { to: chat._id, istyping: false });
        //console.log('typing stopped');
    }
    let handleKey = (e) => {

        if (e.keyCode === 13  && !e.shiftKey) {
            return sendMessage()
        }
        if (typing == false) {
            typing = true
            //console.log('typing started');
            socket.emit("typing", { to: chat._id, istyping: true });
            timeout = setTimeout(timeoutFunction, 5000);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 5000);
        }
    }

    const fetchMore = (page) => {
        setIsFetching(true)
        axios.get(`/chat/${params.chatid}/messages?page=${page+1}`)
            .then(res => {
                setMessages(prev=>([...res.data.messages,...prev]))
                setCurrentPage(page+1)
                setIsFetching(false)
            })
            .catch(err => {
                setIsFetching(false)
                err && err.response && setError(err.response?.data)
                console.log(err);
            })
    }

    useEffect(() => {
        if (params.chatid) {
            //setIsLoading(true)
            setError(null)
            //setChat(null)
            setCurrentPage(1)
            setCount(0)
            axios.get(`/chat/${params.chatid}/messages?page=${0}`)
                .then(res => {
                    setChat(res.data.chat)

                    setCount(res.data.count)
                    dispatch({
                        type: "MARK_READ",
                        payload: res.data.chat._id
                    })
                    socket.emit("joinchat", { id: res.data.chat._id })
                    setIsLoading(false)
                    // setMessages(res.data.messages)
                    dispatch({
                        type: "UPDATE_CHAT_MESSAGES",
                        payload: { chat: res.data.chat._id, messages: res.data.messages }
                    })
                    scrollIntoBottom()
                })
                .catch(err => {
                    setIsLoading(false)
                    err && err.response && setError(err.response?.data)
                    console.log(err);
                })

            return () => {
                socket && socket.removeListener('joinchat');
                socket && socket.emit('leavechat', { id: params.chatid })
            }
        }
    }, [params])

    const findUser = (users) => {
        let otherUser = users.filter(u => u._id !== profile._id)[0]
        return otherUser
    }

    const clearFields = () => {
        setText("")
    }

    const dispatchLatest = (latestMessage) => {
        dispatch({
            type: "UPDATE_LATEST_MESSAGE",
            payload: { chatId: chat._id, latestMessage }
        })
    }


    useEffect(() => {
        if (messagesPending.length > 0) {
            setMessagesPending(prev => prev.slice(0, -1))
        }

    }, [messages])


    const sendMessage = () => {
        let successFiles = files.filter(file => file.response !== undefined)
        if (!text && successFiles.length === 0) {
            return alert("Write something")
        }
        let filesData = successFiles.map(file => ({ name: file.name, type: file.type, size: file.size, url: file.response }))


        setIsSendingText(true)
        let data = {
            type: "text",
            content: text,
            files: filesData
        }
        let randomId = Math.floor(Math.random() * (999999 - 1111) + 1111)
        // setMessagesPending(prev => [...prev, {
        //     ...data,
        //     _id: randomId,
        //     sender: {
        //         _id: randomId,
        //         fullName: profile?.firstName + " " + profile?.lastName,
        //         profilePicture: profile.profilePicture
        //     },
        //     createdAt: Date.now(),
        //     isSending: true
        // }])
        setText('')
        axios.put(`/chat/sendmessage/${chat._id}`, data)
            .then(res => {
                dispatch({
                    type:"PUSH_MESSAGE",
                    payload: {chat:chat?._id,message:res.data.message}
                })
                //setMessages(prev => [...prev, res.data.message])
                dispatchLatest(res.data.message)
                socket.emit("sendmessage", { message: res.data.message, chatid: chat._id })
                clearFields()
                setIsSendingText(false)
                setFiles([])
                scrollIntoBottom()
            })
            .catch(err => {
                setIsSendingText(false)
                console.log(err);
            })
    }





  //scroll to last message automatically
  let lastmsgref = useRef()
    

//   useEffect(() => {
//       if (lastmsgref.current) {
//           lastmsgref.current.scrollIntoView({
//               behavior: "smooth",
//               block: "end",
//               inline: "nearest"
//           })
//       }
//   },[lastmsgref,messages[messages.length-1]])

const scrollIntoBottom = () => {
    if (lastmsgref.current) {
        lastmsgref.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        })
    }
}




    const EditorToolbar = useCallback(
        ({ handleSendText }) => (
            <div id="toolbar">

                <span className="ql-formats">
                    <button className="ql-bold" />
                    <button className="ql-italic" />
                    <button className="ql-underline" />
                    <button className="ql-strike" />
                </span>
                <span className="ql-formats">
                    <button className="ql-list" value="ordered" />
                    <button className="ql-list" value="bullet" />
                    <button className="ql-blockquote" />
                </span>
 
                <span className="ql-formats">
                    <select className="ql-align" />
                    <button className="ql-code-block" />
                </span>
                <span className="ql-formats">
                </span>
                {/* <span className="ql-formats">
              <button className="ql-formula" />
              
               <button className="ql-clean" /> 
            </span> */}
                <span className="actions">
                    <IoIosAttach style={{ marginRight: "10px" }} onClick={() => uploadRef.current.click()} className='icon' size={20} />
                    <IoMdSend onClick={handleSendText} className='icon' size={20} />
                </span>
            </div>
        ),
        []
    );



    const uploadImage = async options => {
        const { onSuccess, onError, file, onProgress } = options;


        const fmData = new FormData();
        const config = {
            headers: { "content-type": "multipart/form-data" },
            onUploadProgress: event => {
                const percent = Math.floor((event.loaded / event.total) * 100);
                //setProgress(percent);
                if (percent === 100) {
                    //setTimeout(() => setProgress(0), 1000);
                }
                onProgress({ percent: (event.loaded / event.total) * 100 });
            }
        };


        fmData.append("file", file)
        try {
            const res = await axios.post(
                "/chat/file",
                fmData,
                config
            );

            onSuccess(res.data.url);

        } catch (err) {

            onError({ err });
        }
    };


    const handleChange = ({ fileList }) => setFiles(fileList);

    const handleUpdateChat = (chat) => {
        if (chat) {
            setChat((prev) => ({ ...prev, ...chat }))
            socket.emit("updatechat", { chat })
        }
    }

    const handleUpdateMessage = (message) => {
        dispatch({
            type:"UPDATE_MESSAGE",
            payload:{chat:chat?._id,message}
        })

        socket.emit("updatemessage", { chatid: chat?._id, message })
    }


    return (
        <>
            <ChatList>

                <div className="chat_container">
                    {
                        isLoading ?
                            <div className='d_flex d_center' style={{ height: "100%" }}>
                                <Spin size={'large'} />
                            </div> :
                            chat ?
                                <>
                                    <div className="top_bar">
                                        <div className="left">
                                            {chat && chat.isChannel ? <span onClick={() => setIsDetailsModalVisible(true)} >{`# ${chat.name}`} <FaAngleDown style={{ marginLeft: "5px" }} /></span> : findUser(chat.users)?.fullName}


                                        </div>

                                        <div onClick={() => setIsDetailsModalVisible(true)} className="right">
                                            {
                                                chat.isChannel &&
                                                <Avatar.Group maxStyle={{ background: "black" }} maxCount={3}>
                                                    {
                                                        chat?.users && chat.users.length > 0 && chat.users.map((user, i) => (
                                                            <Avatar style={{ background: "black" }} key={i} src={user?.profilePicture}>{user?.fullName}</Avatar>
                                                        ))
                                                    }


                                                </Avatar.Group>

                                            }
                                        </div>
                                    </div>
                                    <div className="message_wapper">
                                        <div className='start_list'>

                                        {
                                                currentPage*30 < count  ?  <button disabled={isFetching} className='fetch_more' onClick={()=>fetchMore(currentPage)}> {isFetching ? <Spin/>:"fetch more"} </button>:
                                                chat.isChannel ?
                                                <>
                                                    <Avatar style={{ background: "#062539" }} size={60} >{chat?.name}</Avatar>
                                                    <p>This is the very begining of the <strong>{chat?.name}</strong> channel</p>
                                                </>
                                                :
                                                <>
                                                    <Avatar size={60} src={chat && findUser(chat.users)?.profilePicture || '/placeholder.jpg'} />
                                                    <p>This is the very begining of the chat with <strong>{chat && findUser(chat.users)?.fullName}</strong></p>
                                                </>
                                            }

                                        </div>
                                        <ul className='list_wrapper'>

                                        {
                                                chatMessages[params.chatid] &&
                                                [...messages, ...chatMessages[params.chatid]||undefined, ...messagesPending].map((message, index) => {
                                                    const lastmessage =  [...messages, ...chatMessages[params.chatid]||undefined, ...messagesPending].length - 1 === index
                                                    return (
                                                        <Message
                                                            lastmessage={lastmessage}
                                                            ref={lastmessage ? lastmsgref : null} key={index}
                                                            message={message}
                                                            handleUpdateMessage={(message) => handleUpdateMessage(message)}
                                                        />
                                                    )

                                                }
                                                )
                                            }

                                            {isTyping &&
                                                <li>

                                                    <img ref={lastmsgref} style={{ height: "60px" }} src="/typing.gif" alt="" />
                                                </li>
                                            }
                                        </ul>
                                    </div>
                                    {
                                        chat && !chat.readOnly &&
                                        <div className="input_wrapper">
                                            <div className="text-editor">

                                                <EditorToolbar handleSendText={() => sendMessage()} />
                                                <ReactQuill
                                                    value={text}
                                                    onChange={value => setText(value)}
                                                    onKeyDown={handleKey}
                                                    modules={modules}
                                                    formats={formats}
                                                />
                                                <Upload
                                                    showUploadList={{ showPreviewIcon: false }}
                                                    maxCount={8}
                                                    listType="picture"
                                                    multiple
                                                    fileList={files}
                                                    customRequest={uploadImage}
                                                    onChange={handleChange}
                                                    className='antd_upload_files'
                                                >
                                                    <button style={{ display: "none" }} ref={uploadRef} ></button>
                                                </Upload>
                                            </div>

                                        </div>
                                    }

                                </> :
                                <Empty description="Chat not found or you don't have access on it" />

                    }

                </div>

                {
                    chat && <ChannelDetailsModal 
                    channel={chat} 
                    isVisible={isDetailsModalVisible} 
                    handleUpdateChat={(chat)=>handleUpdateChat(chat)}
                    onCancel={(chat) => {
                        chat && setChat(chat)
                        // console.log(chat);
                        setIsDetailsModalVisible(false);
                    }} />
                }

            </ChatList>
        </>
    )
}

export default ChatDetails
