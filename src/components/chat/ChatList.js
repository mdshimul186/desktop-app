import React, { useState, useEffect, useRef } from 'react'
import { FaRegEdit, FaAngleRight, FaPlus, FaRegTrashAlt, FaLock } from 'react-icons/fa'
import { Avatar, message, Modal, notification, Tooltip } from 'antd'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import OnlineUsersList from './OnlineUsers'
import placeholder from '../../assets/placeholder.jpg'
import bot from '../../assets/bot.png'




function ChatList({ children, isListPage }) {
    const { user: profile } = useSelector(state => state.auth)
    const { chats } = useSelector(state => state.chat)
    const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false)
    const [isNewChannelModalVisible, setIsNewChannelModalVisible] = useState(false)
    const [isUserLoading, setIsUserLoading] = useState(false)
    const [users, setUsers] = useState([])

    const [chatLists, setChatLists] = useState([])
    const [channels, setChannels] = useState([])


    //channel states
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [members, setMembers] = useState([])


    useEffect(() => {
        let chatArray = chats.filter(c => c.isChannel === false)
        let channelArray = chats.filter(c => c.isChannel === true)
        setChatLists(chatArray)
        setChannels(channelArray)
    }, [chats])

    const searchRef = useRef(null)
    const history = useHistory()
    const params = useParams()
    const dispatch = useDispatch()

    const handleCancelNewChannelModal = () => {

        setIsNewChannelModalVisible(false)
        setStep(1)
        setName('')
        setDescription("")
        setMembers([])
    }
    const handleShowNewChannelModal = () => {
        setIsNewChannelModalVisible(true)

    }

    const handleCancelNewChatModal = () => {
        setIsNewChatModalVisible(false)
    }
    const handleShowNewChatModal = () => {
        setIsNewChatModalVisible(true)

    }

    useEffect(() => {
        if (isNewChatModalVisible) {
            searchRef?.current?.focus()
        }
    }, [isNewChatModalVisible])

    const handleSearchUser = (value) => {
        setTimeout(() => {
            setIsUserLoading(true)
            axios.get(`/chat/searchuser?query=${value?.trim() || ""}`)
                .then(res => {
                    setUsers(res.data.users);
                    setIsUserLoading(false)
                }).catch(err => {
                    setIsUserLoading(false)
                    //console.log(err);
                })
        }, 200)

    }

    const findUser = (users) => {
        let otherUser = users.filter(u => u._id !== profile._id)[0]
        return otherUser
    }

    const handlePushChat = (id) => {
        history.push(`/chat/${id}`)
    }

    function getText(html) {
        var divContainer = document.createElement("div");
        divContainer.innerHTML = html;
        return divContainer.textContent || divContainer.innerText || "";
    }
    function truncateString(str, num) {
        if (str.length > num) {
            return str.slice(0, num) + "...";
        } else {
            return str;
        }
    }


    const handleCreateChat = (id) => {
        axios.post(`/chat/findorcreate/${id}`)
            .then(res => {
                let filtered = chats.filter(c => c._id === res.data.chat._id)

                //console.log(chats,id);
                if (filtered.length > 0) {
                    history.push(`/chat/${res.data.chat._id}`)
                } else {
                    dispatch({
                        type: "UPDATE_CHATS",
                        payload: res.data.chat
                    })
                    history.push(`/chat/${res.data.chat._id}`)
                }

                handleCancelNewChatModal()

            })
            .catch(err => {
                message.error('something went wrong')
            })
    }




    //all channel related actions
    const handleNext = () => {
        if (!name) {
            return notification.error({ message: "Name is required" })
        }
        setStep(2)
    }

    const handleAdd = (user) => {
        setUsers(prev => prev.filter(u => u._id !== user._id))
        if (members.filter(u => u._id === user._id).length > 0) {
            return
        } else {
            setMembers(prev => ([...prev, { ...user, canDelete: true }]))
        }
    }

    const handleRemove = (member) => {
        setMembers((prev) => (prev.filter(m => m._id !== member._id)))
    }

    const handleCreateChannel = () => {
        if (!name) {
            return notification.error({ message: "Name is required" })
        }
        let data = {
            name,
            description,
            users: members.map(m => m._id)
        }
        if (data.users.length < 2) {
            return notification.error({ message: "Please add at least 2 member" })
        }



        axios.post('/chat/create-channel', data)
            .then(res => {
                dispatch({
                    type: "UPDATE_CHATS",
                    payload: res.data.chat
                })
                handleCancelNewChannelModal()
                history.push(`/chat/${res.data.chat._id}`)
            })
            .catch(err => {
                console.log(err);
                message.error("something went wrong")
            })
    }




    return (
        <>

            <div id='chat'>
                <div className="container">
                    <div className="wrapper">
                        <div className={isListPage ? "sidebar list_page" : "sidebar"}>
                            <div className="top">
                                <h4>TS4U Chat</h4>
                                <span onClick={() => handleShowNewChatModal()} className='icon_wrapper'>
                                    <FaRegEdit size={25} className='icon' />
                                </span>
                            </div>
                            <div className="channels">
                                <div className="section_title">
                                    Channels
                                    <Tooltip placement="top" title='Create a new channel'>
                                        <FaPlus onClick={() => handleShowNewChannelModal()} className='icon' size={20} />
                                    </Tooltip>

                                </div>
                                <ul className='channel_list'>
                                    {
                                        channels.length > 0 && channels.map((channel, i) => (
                                            <Tooltip title={channel.name}>
                                                <li onClick={() => handlePushChat(channel._id)} key={i} className={channel.toRead.includes(profile._id) ? "unread" : ""}>

                                                    <span>{channel?.isPublic ? "#" : <FaLock />}</span>
                                                    <span className='name'>{channel.name}</span>
                                                    {
                                                        channel.toRead.includes(profile._id) && <span className='new'>new</span>
                                                    }


                                                </li>
                                            </Tooltip>
                                        ))
                                    }

                                    {/* <li>
                                        <span>#</span>
                                        <span className='name'>TS4U update</span>
                                    </li>
                                    <li>
                                        <span>#</span>
                                        <span className='name'>TS4U update</span>
                                    </li>
                                    <li>
                                        <span>#</span>
                                        <span className='name'>TS4U update</span>
                                    </li> */}
                                </ul>
                            </div>


                            <div className="dm">
                                <div className="section_title">
                                    Direct messages
                                </div>

                                <ul className='dm_list'>
                                    {
                                        chatLists.length > 0 && chatLists.map((chat, i) => (
                                            <li onClick={() => handlePushChat(chat._id)} key={i} className={chat.toRead.includes(profile._id) ? "unread list_item" : "list_item"} >
                                                <div className="img">
                                                    <img src={findUser(chat.users).type === 'bot' ? bot : findUser(chat.users).profilePicture || placeholder} alt="" />
                                                </div>
                                                <div className='info'>
                                                    <div className='name'>
                                                        <span className='user_name'>{findUser(chat.users).fullName || "N/A"}</span>
                                                        {
                                                            chat.toRead.includes(profile._id) && <span className='new'>new</span>
                                                        }
                                                    </div>
                                                    <p >
                                                        {
                                                            !chat.latestMessage ? <>New chat</> :
                                                                chat.latestMessage?.type === 'image' ?
                                                                    <>
                                                                        {chat.latestMessage.sender?.firstName}: Image
                                                                    </>
                                                                    :
                                                                    <span className='text'>
                                                                        {chat.latestMessage.sender?.firstName}: {truncateString(getText(chat.latestMessage.content), 10)}                                                               </span>
                                                        }
                                                    </p>
                                                </div>

                                            </li>
                                        ))
                                    }


                                </ul>
                            </div>


                            <OnlineUsersList />

                        </div>

                        {children}


                    </div>

                </div>
            </div>

            <Modal
                visible={isNewChatModalVisible}
                onCancel={handleCancelNewChatModal}
                title='Search user to chat'
                className='search_user_modal'
                footer={[]}
                style={{ top: "2%" }}
            >
                <input ref={searchRef} placeholder='Search user' className='search_input' onFocus={() => handleSearchUser()} onChange={(e) => handleSearchUser(e.target.value)} />

                <div className='user_list_wraper'>
                    {
                        users.length > 0 && users.map((user, i) => (
                            <div className='user_item' key={i}>
                                <img className='avatar' src={user.profilePicture || placeholder} />
                                <div className="info">
                                    <h3 className="name">{user.fullName}</h3>
                                    <span className="email">{user.email}</span>
                                </div>
                                <button onClick={() => handleCreateChat(user._id)} className='start_btn'>
                                    Start
                                    <FaAngleRight style={{ marginLeft: "5px" }} size={20} />
                                </button>

                            </div>
                        ))
                    }
                </div>
            </Modal>





            <Modal
                visible={isNewChannelModalVisible}
                onCancel={handleCancelNewChannelModal}
                title='Create new channel'
                className='search_user_modal'
                width={600}
                footer={[
                    <button onClick={() => handleCancelNewChannelModal()} style={{ marginRight: "10px" }} className='default_button_outline'>Cancel</button>,
                    step === 1 ?
                        <button onClick={() => handleNext()} className='default_button'> Next</button> :
                        <button onClick={() => handleCreateChannel()} className='default_button'> Create</button>
                ]}
                style={{ top: "2%" }}
            >

                {
                    step === 1 ?
                        <div className='channel_start'>
                            <label htmlFor="name">Channel name: <span className='required'>*</span></label>
                            <input placeholder='Enter channel name' type="text" value={name} onChange={e => setName(e.target.value)} />

                            <label htmlFor="description">Channel description:</label>
                            <textarea placeholder='Enter channel description' value={description} onChange={e => setDescription(e.target.value)} />
                        </div> :

                        <div>
                            <div className='select_container'>
                                {
                                    members.length > 0 && members.map((member, i) => (
                                        <div className='user_input_list' key={i}>
                                            <Avatar size={'small'} src={member.profilePicture || placeholder} />
                                            <span className="name">{member.fullName}</span>
                                            <FaRegTrashAlt onClick={() => handleRemove(member)} style={{ color: "red", marginLeft: "5px", cursor: "pointer" }} />
                                        </div>
                                    ))
                                }
                                <input ref={searchRef} placeholder='Search user' className='multi_select_input' onFocus={() => handleSearchUser()} onChange={(e) => handleSearchUser(e.target.value)} />
                            </div>

                            <div className='user_list_wraper'>
                                {
                                    users.length > 0 && users.map((user, i) => (
                                        <div className='user_item' key={i}>
                                            <img className='avatar' src={user.profilePicture || placeholder} />
                                            <div className="info">
                                                <h3 className="name">{user.fullName}</h3>
                                                <span className="email">{user.email}</span>
                                            </div>
                                            <button onClick={() => handleAdd(user)} className='start_btn'>
                                                Select
                                                <FaAngleRight style={{ marginLeft: "5px" }} size={20} />
                                            </button>

                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                }




            </Modal>
        </>
    )
}

export default ChatList
