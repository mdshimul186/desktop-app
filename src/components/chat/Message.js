import moment from 'moment'
import React, { forwardRef, useState } from 'react'
import { FaDownload } from 'react-icons/fa'
import { AiOutlineMessage, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { MdOutlineAddReaction } from 'react-icons/md'
import parse, { attributesToProps, domToReact } from 'html-react-parser'
import { Image, Dropdown, notification, Tooltip } from 'antd'
import mime from 'mime'
import docImage from '../../assets/doc.png'
import fileImage from '../../assets/file.png'
import pdfImage from '../../assets/pdf.png'
import sheetImage from '../../assets/sheets.png'
import zipImage from '../../assets/zip.png'
import txtImage from '../../assets/txt-file.png'
import typingImage from '../../assets/typing.gif'
import placeholderImage from '../../assets/placeholder.jpg'
import botImage from '../../assets/bot.png'
import axios from "axios";
import Picker from 'emoji-picker-react'
import { useSelector } from 'react-redux'
import { replaceMentionToNode } from "../../helper/utilitis";


const images = ["image/bmp", "image/cis-cod", "image/gif", "image/jpeg", "image/pipeg", "image/x-xbitmap", "image/png"]
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

const generateActivityText = (message) => {

    let activity = message.activity
    if (activity?.type === 'add') {
        return <><b>{message.sender?.fullName}</b> <strong style={{ color: "green" }}>added</strong>  <b>{message.activity?.user?.fullName}</b> </>
    } else if (activity?.type === 'remove') {
        return <><b>{message.sender?.fullName}</b>  <strong style={{ color: "red" }}>removed</strong> <b>{message.activity?.user?.fullName}</b> </>
    } else if (activity?.type === 'join') {
        return <> <b>{message.activity?.user?.fullName}</b> <strong style={{ color: "green" }}>joined</strong> in this channel  </>
    } else if (activity?.type === 'leave') {
        return <> <b>{message.activity?.user?.fullName}</b> <strong style={{ color: "red" }}>left</strong> this channel  </>
    } else {
        return <>N/A</>
    }
}


const Message = forwardRef((props, ref) => {
    const { message, lastmessage, handleUpdateMessage, setThreadMessage, isThread, setEditMessage, setDeleteMessage } = props
    const { user } = useSelector(state => state.auth)

    const [showThread, setShowThread] = useState(false)


    const onEmojiClick = (event, emojiObject) => {
        //setChosenEmoji(emojiObject);
        //console.log(emojiObject);

        axios
            .put(`/chat/react/${message._id}`, { symbol: emojiObject.emoji })
            .then((res) => {
                if (res.data.message) {
                    handleUpdateMessage(res.data.message);
                }
            })
            .catch((err) => {
                console.log(err);
                notification.error({ message: err?.response?.data?.error });
            });
    };

    const pickerOverlay = (
        <Picker
            onEmojiClick={onEmojiClick}
            disableAutoFocus={true}
            //skinTone={SKIN_TONE_MEDIUM_DARK}
            groupNames={{ smileys_people: "PEOPLE" }}
            native
        />
    );

    const options = {
        replace: ({ attribs, children ,name}) => {
          if (!attribs) {
            return;
          }
      
          if (name === 'a') {
            const props = attributesToProps(attribs);
            return <a onClick={e=>{
                e.preventDefault();
                //console.log(attribs);
                window?.electron?.openExternalLink?.open(attribs?.href)
            }} {...props}>{domToReact(children, options)}</a>;
          }
      
        //   if (attribs.class === 'prettify') {
        //     return (
        //       <span style={{ color: 'hotpink' }}>
        //         {domToReact(children, options)}
        //       </span>
        //     );
        //   }
        }
      };

    return (
        message.type === "delete" ? (
            <li className="list_item" ref={lastmessage ? ref : null}>
                <div className="avatar">
                    <img
                        src={
                            message.sender?.type === "bot"
                                ? "/bot.png"
                                : message.sender?.profilePicture || "/placeholder.jpg"
                        }
                        alt=""
                    />
                </div>
                <div className="content">
                    <div className="name">
                        <h3>{message.sender?.fullName}</h3>
                        <span>{moment(message.createdAt).fromNow()}</span>
                    </div>
                    <div className="text">
                        <p className="deleted_message">this message has been deleted</p>

                    </div>
                </div>
            </li>
        ) :
            message.type === 'activity' ?
                <div ref={lastmessage ? ref : null} className="activity">
                    <p>{generateActivityText(message)}</p>
                </div>
                :
                <li className='list_item' ref={lastmessage ? ref : null} >

                    <div className="avatar">
                        <img src={message.sender?.type === 'bot' ? botImage : message.sender?.profilePicture || placeholderImage} alt="" />
                    </div>
                    <div className="content">
                        <div className="name">
                            <h3>{message.sender?.fullName}</h3>
                            <span>{moment(message.createdAt).fromNow()}</span>

                            {
                                !isThread &&
                                <div className="message_actions">


                                    <Dropdown
                                        className="emoji_drop"
                                        overlay={pickerOverlay}
                                        trigger={["click"]}
                                    >
                                        <a
                                            className="ant-dropdown-link"
                                            style={{ display: "flex", alignItems: "center" }}
                                            onClick={(e) => e.preventDefault()}
                                        >

                                            <Tooltip placement="top" title="Add reaction">

                                                <MdOutlineAddReaction style={{ marginRight: "10px" }} className="icon" size={20} />
                                            </Tooltip>

                                        </a>
                                    </Dropdown>
                                    <Tooltip placement="top" title="Reply in thread">
                                        <AiOutlineMessage className="icon" size={20} onClick={() => setThreadMessage(message)} />
                                    </Tooltip>
                                    {
                                        message?.sender?._id === user._id &&
                                        <>
                                            <Tooltip placement="top" title="Edit you message">
                                                <AiOutlineEdit className="icon" size={20} onClick={() => setEditMessage(message)} />
                                            </Tooltip>
                                            <Tooltip placement="top" title="Delete this message">
                                                <AiOutlineDelete className="icon" size={20} onClick={() => setDeleteMessage(message)} />
                                            </Tooltip>
                                        </>
                                    }

                                </div>
                            }
                        </div>
                        <div className="text">
                            {parse(replaceMentionToNode(message.content),options)}
                            {
                                message?.edited && <span className="edited">(edited)</span>
                            }
                            {
                                message?.files?.length > 0 &&
                                <div className="file_download_list">
                                    {
                                        message?.files.map((file, i) => (
                                            <>
                                                {
                                                    message?.files.length === 1 && images.includes(file.type) ? <Image style={{ maxWidth: "100%" }} src={file.url} /> :
                                                        <div className='file_download_item' key={i}>


                                                            <div className="thumb">
                                                                {
                                                                    images.includes(file.type) ? <Image sizes={10} src={file.url} /> :
                                                                        file.type === 'application/pdf' ? <img src={pdfImage} /> :
                                                                            file.type === 'text/plain' ? <img src={txtImage} /> :
                                                                                file.type === 'application/msword' || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? <img src={docImage} /> :
                                                                                    file.type === 'application/vnd.ms-excel' || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? <img src={sheetImage} /> :
                                                                                        file.type === 'application/zip' || file.type === 'application/x-zip-compressed' ? <img src={zipImage} /> :
                                                                                            <img src={fileImage} />
                                                                }

                                                            </div>
                                                            <div className='info'>
                                                                <div className="title">
                                                                    <h5 className="file_name">{file.name || "N/A"}</h5>
                                                                    <a href={file?.url}>
                                                                        <FaDownload className='download' />
                                                                    </a>
                                                                </div>
                                                                <div className="type">
                                                                    <span className='mime'> {mime.getExtension(file.type) || 'File'}</span>

                                                                    ({bytesToSize(file.size || 0)})
                                                                </div>
                                                            </div>



                                                        </div>
                                                }
                                            </>


                                        ))
                                    }

                                </div>

                                // <Upload
                                // fileList={ message?.files}
                                // listType='picture'
                                // showUploadList={{showDownloadIcon:true,showRemoveIcon:false}}
                                // className='antd_upload_files'

                                // />

                            }

                            {
                                !isThread && message?.replies?.length > 0 &&
                                <div className="replies_wrapper">
                                    <span onClick={() => setShowThread(prev => !prev)} className="replies_count">{message.replies.length} replies</span>
                                    {
                                        showThread &&
                                        <ul className="list_wrapper">
                                            {
                                                message.replies.map((reply, i) => (
                                                    <li className="list_item" key={i}>
                                                        <div className="avatar">
                                                            <img
                                                                src={
                                                                    reply.sender?.type === "bot"
                                                                        ? "/bot.png"
                                                                        : reply.sender?.profilePicture || "/placeholder.jpg"
                                                                }
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div className="content">
                                                            <div className="name">
                                                                <h3>{reply.sender?.fullName}</h3>
                                                                <span>{moment(reply.createdAt).fromNow()}</span>
                                                            </div>
                                                            <div className="text">
                                                                {parse(replaceMentionToNode(reply.content),options)}
                                                            </div>
                                                        </div>

                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    }


                                </div>

                            }


                        </div>
                        {
                            message?.isSending && <p className='status'>Sending...</p>
                        }

                        {message.emoji && message.emoji.length > 0 && (
                            <span className="emoji_container">
                                {message.emoji.map((emoji, i) => (
                                    <span className="emoji_symbol">{emoji.symbol}</span>
                                ))}
                                {message.emoji.length}
                            </span>
                        )}

                    </div>



                </li>
    )
})

export default Message
