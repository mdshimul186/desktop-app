import moment from 'moment'
import React, { forwardRef } from 'react'
import { FaDownload, FaFileAlt, FaFilePdf } from 'react-icons/fa'
import { GrEmoji } from 'react-icons/gr'
import parse from 'html-react-parser'
import { Image ,Dropdown, notification} from 'antd'
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
    const { message, lastmessage, handleUpdateMessage } = props

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

    return (
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

                        <Dropdown
                            className="emoji_drop"
                            overlay={pickerOverlay}
                            trigger={["click"]}
                        >
                            <a
                                className="ant-dropdown-link"
                                onClick={(e) => e.preventDefault()}
                            >
                                  <GrEmoji  style={{ fontSize: "20px", color: "black" }} />
                            </a>
                        </Dropdown>
                    </div>
                    <div className="text">
                        {parse(message.content)}
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
