import React, { Component } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import QuillMention from 'quill-mention'
import { IoMdSend, IoIosAttach } from 'react-icons/io'
let atValues = [];
const hashValues = [
    { id: 3, value: 'Fredrik Sundqvist 2' },
    { id: 4, value: 'Patrik Sjölin 2' }
]


export default class Editor extends Component {
    state = {
        text: '',
        atValues: [],
        isOpenMention:false
    }

 


    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.users !== this.state.atValues) {
            //console.log(nextProps.users);
            let values = nextProps.users.map(u => ({ id: u._id, value: u.fullName, email: u.email, link: `#${u._id}` }))
            atValues = [...values, { id: "all_member", value: "all member", link: `#all_member` }]
            this.setState({ atValues: nextProps.users });
        }
    }

    handleChange = (value) => {
        this.setState({ text: value })
    }

    mentionModule = {
        allowedChars: /^[A-Za-z\s]*$/,
        mentionDenotationChars: ["@", "#"],
        //linkTarget:"https://www.google.com",
        linkTarget: "_self",
        //dataAttributes:['id', 'target','disabled'],
        onOpen:()=>{this.setState({isOpenMention:true})},
        onClose:()=>{setTimeout(() => {
            this.setState({isOpenMention:false})
        }, 100);},
        renderItem: (item, searchTerm) => (`${item.value} ${item?.email ? " (" + item.email + ")" : ""}`),
        source: function (searchTerm, renderList, mentionChar) {
            let values;

            if (mentionChar === "@") {
                values = atValues;
            }
            // else {
            //     values = hashValues;
            // }

            if (searchTerm.length === 0) {
                renderList(values.slice(0, 15), searchTerm);
            } else {
                const matches = values.filter(v => v.value.toLowerCase().includes(searchTerm));

                // for (i = 0; i < values.length; i++)
                //     if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(values[i]);
                renderList(matches.slice(0, 15), searchTerm);
            }
        },
    }

    render(props) {
        let { text, handleChange, sendText, onUploadClick, users, onKeyDown, className, source ,cancelText,} = this.props
        return (
            <>
                <div className="text-editor">
                    <div className={`toolbar ${className}`}>

                        <span className="ql-formats">
                            <button className="ql-bold" />
                            {
                                source === 'chat' &&
                                <>
                                    <button className="ql-italic" />
                                    <button className="ql-underline" />
                                    <button className="ql-strike" />
                                </>
                            }

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





                        <span className="actions">


                            {
                                source === 'chat' &&
                                <>
                                    <IoIosAttach style={{ marginRight: "10px" }} onClick={onUploadClick} className='icon' size={20} />
                                    <IoMdSend onClick={sendText} className='icon' size={20} />
                                </>
                            }

                            {
                                source === 'thread' && <IoMdSend onClick={sendText} className='icon' size={20} />
                            }

                            {
                                source === 'update_message' &&
                                <div className='update_message_wrapper'>
                                <button onClick={cancelText} className='update_button cancel'>Cancel</button>
                                <button onClick={sendText} className='update_button update '>Update</button>
                                </div>
                            }

                        </span>
                    </div>
                    <ReactQuill value={text}
                        modules={{
                            toolbar: {
                                container: `.${className}`,
                            },
                            mention: this.mentionModule,
                            
                        }} 
                        onKeyDown={(e)=>onKeyDown(e,this.state.isOpenMention)}
                        onChange={handleChange}
                        />


                    {/* <button onClick={() => sendText()}>send</button> */}
                </div>
            </>
        )
    }
}