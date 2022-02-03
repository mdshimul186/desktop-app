import React, { useState } from 'react';
import { Modal, notification } from 'antd'
import axios from 'axios';
import QuillEditor from './TextQuill'


function EditMessage({ message, chat, handleCloseEdit, handleUpdateMessage }) {
    const [text, setText] = useState(message?.content || "")
    const [isEditing, setIsEditing] = useState(false)

    let handleKey = (e,isOpenMention) => {
        // if (e.keyCode === 13 && !e.shiftKey && !isOpenMention) {
        //     return updateMessage()
        // }
    }

    const updateMessage = () => {
        if (!text) {
            return notification.error({ message: "Please write something" })
        }
        let data = {
            content: text.replaceAll("<p><br></p>", "")
        }
        setIsEditing(true)
        axios.patch(`/chat/update/message/${message?._id}`, data)
            .then(res => {
                setText("")
                notification.success({ message: "Message updated successfully" })
                handleUpdateMessage(res.data.message)
                setIsEditing(false)
                handleCloseEdit()

            })
            .catch(err => {
                setIsEditing(false)
                console.log(err);
                notification.error({ message: err?.response?.data?.error })
            })
    }


    return (
        <Modal
            visible={Boolean(message)}
            onCancel={handleCloseEdit}
            footer={false}
            width={600}
        // footer={[
        //     <button onClick={()=>handleCloseEdit()} style={{ marginRight: "10px" }} className='default_button_outline'>Cancel</button>,
        //     <button className='default_button'>Update</button>
        // ]}

        >
            <div style={{ margin: "20px 0" }} className="input_wrapper">

                <QuillEditor
                    cancelText={() => handleCloseEdit()}
                    source="update_message"
                    className="edit"
                    onKeyDown={handleKey}
                    text={text}
                    handleChange={val => setText(val)}
                    sendText={() => updateMessage()}
                    users={chat?.users}
                //onUploadClick={() => uploadRef.current.click()}
                />

            </div>

        </Modal>
    );
}

export default EditMessage;
