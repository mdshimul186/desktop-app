import { Modal, notification, Spin } from 'antd';
import moment from 'moment';
import React,{useState} from 'react';
import parse from 'html-react-parser'
import axios from 'axios';

function DeleteMessage({ message, cancelDeleteModal ,handleUpdateMessage}) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete=()=>{
        setIsDeleting(true)
            axios.delete(`/chat/delete/message/${message?._id}`)
            .then(res=>{
                notification.success({message:"Message deleted successfully"})
                handleUpdateMessage(res.data.message)
                setIsDeleting(false)
                cancelDeleteModal()
            })
            .catch(err=>{
                setIsDeleting(false)
                console.log(err);
                notification.error({message:err?.response?.data?.error})
            })
    }
    return (
        <Modal
            title={'Delete Message'}
            visible={Boolean(message)}
            onCancel={cancelDeleteModal}
            className='delete_message_modal'
            width={600}
            footer={[
                <button style={{marginRight:"10px"}} className='default_button_outline'>Cancel</button>,
                <button onClick={()=>handleDelete()} disabled={isDeleting} className='default_button'>{isDeleting && <Spin />} Delete</button>
            ]}
        >
            <p className='warning'>Are you sure you want to delete this message? This cannot be undone.</p>

            <div className="message_wrapper">
                <div className="left">
                    <img src={message?.sender?.profilePicture||"/placeholder.jpg"} className="avatar" />
                </div>
                <div className="right">
                    <div className="name_info">
                        <div className="name">
                            {message?.sender?.fullName}
                        </div>
                        <span className="time">{moment(message.createdAt).fromNow()}</span>
                    </div>
                    <div className="content">
                        {
                            parse(message?.content||"")
                        }
                    </div>
                </div>
            </div>

        </Modal>
    );
}

export default DeleteMessage;
