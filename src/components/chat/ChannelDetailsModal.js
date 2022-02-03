import React, { useState, useEffect } from 'react'
import { Avatar, Modal, notification, Tabs, Popconfirm,Spin } from 'antd'
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios';
import { FaRegTrashAlt } from 'react-icons/fa';
const { TabPane } = Tabs;

function ChannelDetailsModal({ channel, isVisible, onCancel ,handleUpdateChat}) {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('about')

    const [users, setUsers] = useState([])

    const [searchedUser, setSearchedUser] = useState([])
    const [isUserLoading, setIsUserLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState([])

    const [updateChannelName, setUpdateChannelName] = useState({status:false,name:""})
    const [updateChannelDescription, setUpdateChannelDescription] = useState({status:false,description:""})

    const [addingList, setAddingList] = useState([])
    const [removingList, setRemovingList] = useState([])


    useEffect(() => {
        if (channel) {
            setUsers(channel?.users || [])
        }
    }, [channel, isVisible])


    const handleRemove = (id) => {
        setUsers(prev => (prev.filter(u => u._id !== id)))

    }

    const handleRemoveUser = (userId) => {
        let data = {
            user: userId
        }
        setRemovingList(prev=>[...prev,userId])
        axios.patch(`/chat/channel/remove-user/${channel._id}`, data)
            .then(res => {
                dispatch({
                    type: "UPDATE_CHATS",
                    payload: res.data.chat
                })
                setRemovingList(prev=>prev.filter(id=>id!==userId))
                //onCancel(res.data.chat)
            })
            .catch(err => {
                setRemovingList(prev=>prev.filter(id=>id!==userId))
                err && err?.response && notification.error({ message: err?.response?.data?.error })
            })
    }

    const adduserChannel = (userId) => {
        let data = {
            user:userId
        }
        setAddingList(prev=>[...prev, userId])
        axios.patch(`/chat/channel/adduser/${channel._id}`, data)
            .then(res => {
                dispatch({
                    type: "UPDATE_CHATS",
                    payload: res.data.chat
                })
                setAddingList(prev=>prev.filter(id=>id!==userId))
                //onCancel(res.data.chat)
            })
            .catch(err => {
                setAddingList(prev=>prev.filter(id=>id!==userId))
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

    const handleLeave = () => {
        axios.patch(`/chat/channel/leave/${channel._id}`)
            .then(res => {
                window.location.reload()
            })
            .catch(err => {
                notification.error({ message: "Something went wrong" })
            })
    }

    const handleArchived = (isArchived) => {
        axios.patch(`/chat/channel/archive/${channel._id}`, { isArchived })
            .then(res => {
                window.location.reload()
            })
            .catch(err => {
                notification.error({ message: "Something went wrong" })
            })
    }


    const handleUpdateChatInfo=(type)=>{
        let data ={

        }
        if (type === 'name'){
            if(!updateChannelName.name){
                return notification.error({message:"Channel name is required"})
            }else  if(updateChannelName.name === channel.name){
                return setUpdateChannelName({status:false, name:""})
            }else{
                data.name = updateChannelName.name
            }
           
        }

        if (type === 'description'){
            if(!updateChannelDescription.description){
                return setUpdateChannelDescription({status:false, name:""})
            }else if(updateChannelDescription.description === channel.description){
                return setUpdateChannelDescription({status:false, name:""})
            }else{
                data.description = updateChannelDescription.description
            }
           
        }

        axios.patch(`/chat/channel/update-info/${channel?._id}`,data)
        .then(res=>{
            if(res.data.chat){
               // handleUpdateChat(res.data.chat)
               let chat = res.data.chat
               dispatch({
                type: "UPDATE_CHATS",
                payload: {_id:chat?._id,name:chat?.name,description:chat?.description}
            })
                if (type === 'description'){
                    setUpdateChannelDescription({status:false,description:""})
                }
                if (type === 'name'){
                    setUpdateChannelName({status:false,name:""})
                }
            }
        })
        .catch(err => {
            console.log(err);
            notification.error({ message: err?.response?.data?.error })
        })
    }



    return (
        <Modal
            visible={isVisible}
            onCancel={() => onCancel(null)}
            footer={false}
            // footer={
            //     channel?.initiator?._id === user._id && activeTab === 'members' ? [
            //         <button onClick={() => onCancel(null)} style={{ marginRight: "10px" }} className='default_button_outline'>Cancel</button>,
            //         <button onClick={() => handleUpdateChannel()} className='default_button'>Save</button>
            //     ] :
            //         channel?.initiator?._id === user._id && activeTab === 'add' ? [
            //             <button onClick={() => onCancel(null)} style={{ marginRight: "10px" }} className='default_button_outline'>Cancel</button>,
            //             <button onClick={() => adduserChannel()} className='default_button'>Add</button>
            //         ]

            //             : []
            // }
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
                            <div className='title'>
                                <label>Name</label>
                                {
                                      channel?.initiator?._id === user._id && 
                                      <div>
                                      {
                                          updateChannelName.status ?
                                          <>
                                          <button onClick={()=>setUpdateChannelName({status:false,name:""})} className='edit_button_cancel'>Cancel</button>
                                          <button onClick={()=>handleUpdateChatInfo("name")} className='edit_button'>Save</button>
                                          </>:
                                      <button onClick={()=>setUpdateChannelName({status:true,name:channel?.name||""})} className='edit_button'>Edit</button>

                                      }
                                      </div>
                                }
                                
                            </div>
                            {
                                updateChannelName.status ?
                                <input value={updateChannelName.name} onChange={(e)=>setUpdateChannelName(prev=>({...prev,name:e.target.value}))} className='edit_input' defaultValue={channel.name} />:
                                <h3>{channel.name || "N/A"}</h3>
                            }
                           
                        </li>
                        <li>
                            <div className='title'>
                                <label>Description</label>
                                {
                                      channel?.initiator?._id === user._id && 
                                      <div>
                                      {
                                          updateChannelDescription.status ?
                                          <>
                                          <button onClick={()=>setUpdateChannelDescription({status:false,description:""})} className='edit_button_cancel'>Cancel</button>
                                          <button onClick={()=>handleUpdateChatInfo("description")} className='edit_button'>Save</button>
                                          </>:
                                      <button onClick={()=>setUpdateChannelDescription({status:true,description:channel?.description||""})} className='edit_button'>Edit</button>

                                      }
                                      </div>
                                }
                              
                            </div>
                            {
                                updateChannelDescription.status ?
                                <textarea  value={updateChannelDescription.description} onChange={(e)=>setUpdateChannelDescription(prev=>({...prev,description:e.target.value}))} className='edit_input' defaultValue={channel.description} />:
                                <h3>{channel.description || "N/A"}</h3>
                            }
                            
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
                                    onConfirm={() => handleArchived(true)}
                                >
                                    <button className='leave_button'>Archive Channel</button>
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
                                                    <button disabled={removingList.includes(u._id)} onClick={() => handleRemoveUser(u._id)} className='remove'>
                                                         {removingList.includes(u._id) && <Spin/>} Remove
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
                            {/* {
                                selectedUser.length > 0 && selectedUser.map((member, i) => (
                                    <div className='user_input_list' key={i}>
                                        <Avatar size={'small'} src={member.profilePicture || "/placeholder.jpg"} />
                                        <span className="name">{member.fullName}</span>
                                        <FaRegTrashAlt onClick={() => handleRemoveSelected(member)} style={{ color: "red", marginLeft: "5px", cursor: "pointer" }} />
                                    </div>
                                ))
                            } */}
                            <input style={{width:"100%"}} placeholder='Search user' className='multi_select_input' onFocus={() => handleSearchUser()} onChange={(e) => handleSearchUser(e.target.value)} />
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
                                        <button disabled={users.find(u => u._id === user._id)||addingList.includes(user._id)} onClick={() => adduserChannel(user._id)} className='add_btn'>
                                        {addingList.includes(user._id) && <Spin/>}

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
