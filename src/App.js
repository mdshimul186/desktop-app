import Auth from "./pages/Auth";
import withAuth from "./helper/withAuth";
import { Route, Switch ,useHistory} from "react-router-dom";
import Chat from "./pages/Chat";
import ProtectedRoute from "./helper/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ChatDetails from "./pages/ChatDetails";
function App({userData}) {
  let history = useHistory()
  if(!userData){
    history.push('/')
  }else{
    history.push('/chat')
  }
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
