import Auth from "./pages/Auth";
import withAuth, { socket } from "./helper/withAuth";
import { Route, Switch ,useHistory} from "react-router-dom";
import Chat from "./pages/Chat";
import ProtectedRoute from "./helper/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ChatDetails from "./pages/ChatDetails";
import { useEffect,useState } from "react";
import {useDispatch} from 'react-redux'
import {handleMessageNoti} from './helper/utilitis'

function App({userData}) {
  const [audio] = useState(new Audio(require('./assets/noti.wav')));
  let history = useHistory()
  const dispatch = useDispatch()
  if(!userData){
    history.push('/')
  }else{
    history.push('/chat')
  }

  // const handleChatNoti=(chat)=>{
  //   chat.latestMessage?.content &&
  //   window.electron.notificationApi.sendNotification(
  //     {
  //       title: chat.isChannel ? chat.name + ": " + chat?.latestMessage?.sender?.fullName : chat?.latestMessage?.sender?.fullName,
  //       body:htmlToStr(chat.latestMessage?.content)
  //     }
  //       )
  // }


  useEffect(() => {
    if (socket) {
        socket.on("newmessage", data => {
        let result =  handleMessageNoti(data.chat,userData?._id)
        if(result?.isSent) {
          audio.play()
         }
            dispatch({
                type: "UPDATE_CHATS",
                payload: data.chat
            })
        })

        socket.on("newnotification", data => {
            // console.log(data);
            dispatch({
                type: "NEW_NOTIFICATION",
                payload: data.notification
            })
        })
        socket.on("addOnlineUser", data => {
            // console.log(data);
            dispatch({
                type: "ADD_ONLINE_USER",
                payload: data.user
            })
        })
        socket.on("removeOnlineUser", data => {
            
            dispatch({
                type: "REMOVE_ONLINE_USER",
                payload: data.user
            })
        })
    }
}, [socket])

  return (
    <Switch >
    
      {/* <Route path="/chat" exact component={Chat} />
      <Route path="/" exact component={Auth} /> */}
       {
        userData ?
        <>
        <Route path="/chat/:chatid" exact component={ChatDetails} />
        <Route path="/chat" exact component={Chat} />
        </>
        :
        <Route path="/" exact component={Auth} />

      } 
     
    </Switch>
  );
}

export default withAuth(App);
