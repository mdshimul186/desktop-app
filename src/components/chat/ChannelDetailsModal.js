import React, { useState, useEffect } from 'react'
import { Avatar, Modal, notification, Tabs, Popconfirm } from 'antd'
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios';
import { FaRegTrashAlt } from 'react-icons/fa';
const { TabPane } = Tabs;

function ChannelDetailsModal({ channel, isVisible, onCancel }) {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('about')

    const [users, setUsers] = useState([])

    const [searchedUser, setSearchedUser] = useState([])
    const [isUserLoading, setIsUserLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState([])

    useEffect(() => {
        if (channel) {
            setUsers(channel?.users || [])
        }
    }, [channel, isVisible])


    const handleRemove = (id) => {
        setUsers(prev => (prev.filter(u => u._id !== id)))

    }

    const handleUpdateChannel = () => {
        let data = {
            users: users.map(u => u._id)
        }
        axios.patch(`/chat/channel/update/${channel._id}`, data)
            .then(res => {
                dispatch({
                    type: "UPDATE_CHATS",
                    payload: res.data.chat
                })
                onCancel(res.data.chat)
            })
            .catch(err => {
                err && err?.response && notification.error({ message: err?.response?.data?.error })
            })
    }

    const adduserChannel = () => {
        let data = {
            users: selectedUser.map(u => u._id)
        }
        axios.patch(`/chat/channel/adduser/${channel._id}`, data)
            .then(res => {
                dispatch({
                    type: "UPDATE_CHATS",
                    payload: res.data.chat
                })
                onCancel(res.data.chat)
            })
            .catch(err => {
                err && err?.response && notification.error({ message: err?.response?.data?.error })
            })
    }


    const handleSearchUser = (value) => {
        setTimeout(() => {
            setIsUserLoading(true)
            axios.get(`/chat/searchuser?query=${value?.trim() || ""}`)
                .then(res => {
                    setSearchedUser(res.data.users);
                    setIsUserLoading(false)
                }).catch(err => {
                    setIsUserLoading(false)
                    //console.log(err);
                })
        }, 200)

    }

    const handleAdd = (user) => {
        setSearchedUser(prev => prev.filter(u => u._id !== user._id))
        if (selectedUser.filter(u => u._id === user._id).length > 0) {
            return
        } else {
            setSelectedUser(prev => ([...prev, { ...user, canDelete: true }]))
        }
    }

    const handleRemoveSelected = (member) => {
        setSearchedUser((prev) => (prev.filter(m => m._id !== member._id)))
    }


    const handleLeave = () => {
        axios.patch(`/chat/channel/leave/${channel._id}`)
            .then(res => {
                window.location.reload()
            })
            .catch(err => {
                notification.error({ message: "Something went wrong" })
            })
    }

    const handleArchived = () => {
        axios.patch(`/chat/channel/archive/${channel._id}`)
            .then(res => {
                window.location.reload()
            })
            .catch(err => {
                notification.error({ message: "Something went wrong" })
            })
    }



    return (
        <Modal
            visible={isVisible}
            onCancel={() => onCancel(null)}
            footer={
                channel?.initiator?._id === user._id && activeTab === 'members' ? [
                    <button onClick={() => onCancel(null)} style={{ marginRight: "10px" }} className='default_button_outline'>Cancel</button>,
                    <button onClick={() => handleUpdateChannel()} className='default_button'>Save</button>
                ] :
                    channel?.initiator?._id === user._id && activeTab === 'add' ? [
                        <button onClick={() => onCancel(null)} style={{ marginRight: "10px" }} className='default_button_outline'>Cancel</button>,
                        <button onClick={() => adduserChannel()} className='default_button'>Add</button>
                    ]

                        : []
            }
            title={channel?.name}
            width={500}
            className='chat_details_modal'
            bodyStyle={{ padding: "5px 20px" }}
            style={{ top: "3%" }}
        >
            <Tabs centered activeKey={activeTab} onChange={(v) => setActiveTab(v)} >
                <TabPane tab="About" key="about">
                    <div className="about">
                        <li>
                            <label>Name</label>
                            <h3>{channel.name || "N/A"}</h3>
                        </li>
                        <li>
                            <label>Description</label>
                            <h3>{channel.description || "N/A"}</h3>
                        </li>
                        <li>
                            <label>Created by</label>
                            <h3>{channel.initiator?.fullName || "N/A"} on <span>{moment(channel.createdAt).format("MMMM D,YYYY")}</span></h3>
                        </li>
                        <li>
                            <label>Privacy</label>
                            <h3>{channel.isPublic ? "Public" : "Private"}</h3>
                        </li>

                        <li>
                            <Popconfirm
                                title="Are you sure to leave this channel?"
                                onConfirm={() => handleLeave()}
                                okText="Yes"
                                cancelText="No"
                            >
                                <button className='leave_button'>Leave Channel</button>
                            </Popconfirm>

                        </li>

                        {
                            channel?.initiator?._id === user._id &&
                            <li>
                                <Popconfirm
                                    title='Are you sure to archive this channel?'
                                    okText="Yes"
                                    cancelText='No'
                                    onConfirm={() => handleArchived()}
                                >
                                    <button  className='leave_button'>Archive Channel</button>
                                </Popconfirm>
                            </li>

                        }
                    </div>
                </TabPane>
                <TabPane tab="Members" key="members">
                    <div className='user_list_wraper'>
                        {
                            users.map((u, i) => (
                                <div className='user_item' key={i}>
                                    <img className='avatar' src={u.profilePicture || "/placeholder.jpg"} />
                                    <div className="info">
                                        <h3 className="name">{u.fullName} {u._id === user._id && "(me)"}</h3>
                                        <span className="email">{u.email}</span>
                                    </div>
                                    {
                                        channel?.initiator?._id === user._id &&
                                        <>
                                            {
                                                u._id === user._id ?
                                                    <span className='me'>(me)</span> :
                                                    <button onClick={() => handleRemove(u._id)} className='remove'>
                                                        Remove
                                                    </button>
                                            }

                                        </>

                                    }


                                </div>
                            ))
                        }
                    </div>
                </TabPane>
                {
                    channel?.initiator?._id === user._id &&
                    <TabPane tab="Add Member" key="add">



                        <div className='select_container'>
                            {
                                selectedUser.length > 0 && selectedUser.map((member, i) => (
                                    <div className='user_input_list' key={i}>
                                        <Avatar size={'small'} src={member.profilePicture || "/placeholder.jpg"} />
                                        <span className="name">{member.fullName}</span>
                                        <FaRegTrashAlt onClick={() => handleRemoveSelected(member)} style={{ color: "red", marginLeft: "5px", cursor: "pointer" }} />
                                    </div>
                                ))
                            }
                            <input placeholder='Search user' className='multi_select_input' onFocus={() => handleSearchUser()} onChange={(e) => handleSearchUser(e.target.value)} />
                        </div>

                        <div className='user_list_wraper'>
                            {
                                searchedUser.length > 0 && searchedUser.map((user, i) => (
                                    <div className='user_item' key={i}>
                                        <img className='avatar' src={user.profilePicture || "/placeholder.jpg"} />
                                        <div className="info">
                                            <h3 className="name">{user.fullName}</h3>
                                            <span className="email">{user.email}</span>
                                        </div>
                                        <button disabled={users.find(u => u._id === user._id)} onClick={() => handleAdd(user)} className='add_btn'>

                                            {
                                                users.find(u => u._id === user._id) ?
                                                    "Already Added" :
                                                    "Add"
                                            }
                                        </button>

                                    </div>
                                ))
                            }
                        </div>

                    </TabPane>
                }
                <TabPane tab="Files" key="files">
                    Files list will be available here (comming soon)
                </TabPane>
            </Tabs>
        </Modal>
    )
}

export default ChannelDetailsModal
