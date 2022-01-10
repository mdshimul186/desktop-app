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
    const { chats } = useSelector(state => state.chat)
    const dispatch = useDispatch()
    let params = useParams()
    let uploadRef = useRef()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const [messages, setMessages] = useState([])
    const [messagesPending, setMessagesPending] = useState([])
    const [chat, setChat] = useState(null)
    const [text, setText] = useState("")
    const [isTyping, setisTyping] = useState(false)
    const [files, setFiles] = useState([])

    const [isSendingImage, setIsSendingImage] = useState(false)
    const [isSendingText, setIsSendingText] = useState(false)
    const [rows, setRows] = useState(2)

    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false)

    useEffect(() => {
        if (socket) {
            socket.on("receive", data => {
                if (data?.message?.activity?.type === 'remove' && data?.message?.activity?.user?._id === profile._id) {
                    socket.off('receive');
                    socket.off('istyping');
                }
                setMessages(prev => [...prev, data.message])
                //console.log(data);
            })
            socket.on("istyping", data => {
                setisTyping(data.istyping)
            })
            return () => {
                socket.off('receive');
                socket.off('istyping');

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

  

    useEffect(() => {
        if (params.chatid) {
            setIsLoading(true)
            setError(null)
            setChat(null)
            axios.get(`/chat/${params.chatid}/messages`)
                .then(res => {
                    setChat(res.data.chat)
                    setMessages(res.data.messages)
                    dispatch({
                        type: "MARK_READ",
                        payload: res.data.chat._id
                    })
                    socket.emit("joinchat", { id: res.data.chat._id })
                    setIsLoading(false)
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
        setRows(2)
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
        setMessagesPending(prev => [...prev, {
            ...data,
            _id: randomId,
            sender: {
                _id: randomId,
                fullName: profile?.personalInformation?.firstName + " " + profile?.personalInformation?.lastName,
                profilePicture: profile.profilePicture
            },
            createdAt: Date.now(),
            isSending: true
        }])
        setText('')
        axios.put(`/chat/sendmessage/${chat._id}`, data)
            .then(res => {
                setMessages(prev => [...prev, res.data.message])
                dispatchLatest(res.data.message)
                socket.emit("sendmessage", { message: res.data.message, chatid: chat._id })
                clearFields()
                setIsSendingText(false)
                setFiles([])
            })
            .catch(err => {
                setIsSendingText(false)
                console.log(err);
            })
    }


    //send image using api
    let handleImage = (img) => {
        //setimgsending(true)
        if (img) {
            setIsSendingImage(true)
            let formData = new FormData()
            formData.append('chatimage', img)
            axios.put('chat/sendimage/' + chat._id, formData)
                .then(res => {
                    setMessages(prev => [...prev, res.data.message])
                    dispatchLatest(res.data.message)
                    socket.emit("sendmessage", { message: res.data.message, chatid: chat._id })
                    clearFields()
                    setIsSendingImage(false)
                })
                .catch(err => {
                    setIsSendingImage(false)
                    console.log(err);
                })
        }

    }



    //scroll to last message automatically
    let lastmsgref = useRef()

    useEffect(() => {
        if (lastmsgref.current) {
            lastmsgref.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                //inline: "start"
            })
        }
    })




    const EditorToolbar = useCallback(
        ({ handleSendText }) => (
            <div id="toolbar">
                {/* <span className="ql-formats">
              <select className="ql-font" defaultValue="arial">
                <option value="arial">Arial</option>
                <option value="comic-sans">Comic Sans</option>
                <option value="courier-new">Courier New</option>
                <option value="georgia">Georgia</option>
                <option value="helvetica">Helvetica</option>
                <option value="lucida">Lucida</option>
              </select>
              <select className="ql-size" defaultValue="medium">
                <option value="extra-small">Size 1</option>
                <option value="small">Size 2</option>
                <option value="medium">Size 3</option>
                <option value="large">Size 4</option>
              </select>
              <select className="ql-header" defaultValue="3">
                <option value="1">Heading</option>
                <option value="2">Subheading</option>
                <option value="3">Normal</option>
              </select>
            </span> */}
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
                    {/* <button className="ql-indent" value="-1" />
              <button className="ql-indent" value="+1" /> */}
                </span>
                {/* <span className="ql-formats"> */}
                {/* <button className="ql-script" value="super" />
              <button className="ql-script" value="sub" /> */}

                {/* <button className="ql-direction" /> */}
                {/* </span> */}
                <span className="ql-formats">
                    <select className="ql-align" />
                    <button className="ql-code-block" />
                    {/* <select className="ql-color" />
              <select className="ql-background" /> */}
                </span>
                <span className="ql-formats">
                    {/* <button className="ql-link" /> */}
                    {/* <button className="ql-image" /> */}
                    {/* <button className="ql-video" /> */}
                </span>
                {/* <span className="ql-formats">
              <button className="ql-formula" />
              
               <button className="ql-clean" /> 
            </span> */}
                <span className="actions">
                    {/* <button className="ql-undo">
                <CustomUndo />
              </button>
              <button className="ql-redo">
                <CustomRedo />
              </button> */}
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
                                            {chat && chat.isChannel ? <span onClick={() => setIsDetailsModalVisible(true)} className='d_flex d_center' style={{ cursor: "pointer" }}>{`# ${chat.name}`} <FaAngleDown style={{ marginLeft: "5px" }} /></span> : findUser(chat.users)?.fullName}


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
                                                [...messages, ...messagesPending].length > 0 &&
                                                [...messages, ...messagesPending].map((message, index) => {
                                                    const lastmessage = [...messages, ...messagesPending].length - 1 === index
                                                    return (
                                                        <Message lastmessage={lastmessage} ref={lastmessage ? lastmsgref : null} key={index} message={message} />
                                                        // message.type === 'activity' ?
                                                        //     <div ref={lastmessage ? lastmsgref : null} key={index} className="activity">
                                                        //         <p>{generateActivityText(message)}</p>
                                                        //     </div>
                                                        //     :
                                                        //     <li className='list_item' ref={lastmessage ? lastmsgref : null} key={index} >

                                                        //         <div className="avatar">
                                                        //             <img src={message.sender?.type === 'bot' ? "/bot.png" : message.sender?.profilePicture || "/placeholder.jpg"} alt="" />
                                                        //         </div>
                                                        //         <div className="content">
                                                        //             <div className="name">
                                                        //                 <h3>{message.sender?.fullName}</h3>
                                                        //                 <span>{moment(message.createdAt).fromNow()}</span>
                                                        //             </div>
                                                        //             <div className="text">
                                                        //                 {parse(message.content)}
                                                        //                 {
                                                        //                     message?.files?.length > 0 &&
                                                        //                     <div className="file_donload_list">
                                                        //                         {
                                                        //                             message?.files.map((file, i) => (
                                                        //                                 <div className='file_donload_item' key={i}>
                                                        //                                     <div className="thumb">

                                                        //                                     </div>
                                                        //                                     <div className='info'>
                                                        //                                         <div className="title">
                                                        //                                             <h5 className="name">{file.name || "N/A"}</h5>
                                                        //                                             <FaDownload />
                                                        //                                         </div>
                                                        //                                         <p className="type">PDF ({file.size || 0})</p>
                                                        //                                     </div>
                                                        //                                 </div>
                                                        //                             ))
                                                        //                         }
                                                        //                     </div>

                                                        //                     // <Upload
                                                        //                     // fileList={ message?.files}
                                                        //                     // listType='picture'
                                                        //                     // showUploadList={{showDownloadIcon:true,showRemoveIcon:false}}
                                                        //                     // className='antd_upload_files'

                                                        //                     // />

                                                        //                 }
                                                        //             </div>
                                                        //             {
                                                        //                 message?.isSending && <p className='status'>Sending...</p>
                                                        //             }

                                                        //         </div>



                                                        //     </li>
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
                    chat && <ChannelDetailsModal channel={chat} isVisible={isDetailsModalVisible} onCancel={(chat) => {
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
