import Auth from "./pages/Auth";
import withAuth, { socket } from "./helper/withAuth";
import { Route, Switch ,useHistory} from "react-router-dom";
import Chat from "./pages/Chat";
import ProtectedRoute from "./helper/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ChatDetails from "./pages/ChatDetails";
import { useEffect } from "react";
import {useDispatch} from 'react-redux'

function App({userData}) {
  let history = useHistory()
  const dispatch = useDispatch()
  if(!userData){
    history.push('/')
  }else{
    history.push('/chat')
  }



  useEffect(() => {
    if (socket) {
        socket.on("newmessage", data => {
         
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
