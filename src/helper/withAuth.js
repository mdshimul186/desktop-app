import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from "axios";
import { SpinnerCircularFixed } from 'spinners-react';
import { io } from "socket.io-client";
import {loadChats,loadNotifications,getOnlines} from '../actions/default'

//import {setToast} from './ToastMsg'
import store from "../store";
import { message } from "antd";

const configureAxiosHeader = () => {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common = {
      Authorization: token,
    };
  }

};

// const loadChats = () => {
//   axios.get('/chat/mychats')
//     .then(res => {
//       store.dispatch({
//         type: "SET_CHATS",
//         payload: res.data.chats
//       })
//     })
//     .catch(err => {
//       console.log(err);
//     })
// }

// const loadNotifications = () => {
//   axios.get('/notification/mynotifications')
//     .then(res => {
//       store.dispatch({
//         type: "SET_NOTIFICATIONS",
//         payload: res.data.notifications
//       })
//     })
//     .catch(err => {
//       console.log(err);
//     })
// }
// const getOnlines = () => {
//   axios.get('/user/online')
//     .then(res => {
//       store.dispatch({
//         type: "SET_ONLINE_USERS",
//         payload: res.data.users
//       })
//     })
//     .catch(err => {
//       console.log(err);
//     })
// }

export let socket

const withAuth = (AuthComponent) => {
  return class Authenticated extends Component {
    static async getInitialProps(ctx) {

      // Ensures material-ui renders the correct css prefixes server-side
      let userAgent;
      // eslint-disable-next-line no-undef
      if (process.browser) {
        // eslint-disable-next-line prefer-destructuring
        userAgent = navigator.userAgent;
      } else {
        userAgent = ctx.req?.headers["user-agent"];
      }

      // Check if Page has a `getInitialProps`; if so, call it.
      const pageProps =
        AuthComponent.getInitialProps &&
        (await AuthComponent.getInitialProps(ctx));
      // Return props.
      return { ...pageProps, userAgent };
    }

    constructor(props) {
      super(props);
      this.state = {
        isLoading: false,
        userData: null,
      };
    }

    componentDidMount() {

      configureAxiosHeader();

      const token = localStorage.getItem("token")
      //console.log(token);
      if (token) {
        this.setState({ isLoading: true });
        axios
          // eslint-disable-next-line no-undef
          .post(`${process.env.REACT_APP_API_URL}/user/verify`, {})
          .then((res) => {
            if (res.status === 200 && res.data.success) {
              store.dispatch(loadChats())
              store.dispatch(loadNotifications())
              store.dispatch(getOnlines())
              //do some change state
              var options = {
                rememberUpgrade: true,
                transports: ['websocket'],
                secure: true,
                rejectUnauthorized: false
              }

              //socket = io(process.env.REACT_APP_API_URL.split('/api')[0],options);
              socket = io(process.env.REACT_APP_API_SOCKET, options);
              //console.log(socket);

              socket.emit("online", { id: res.data.user._id })


              this.setState({ userData: res.data.user });
              this.setState({ isLoading: false });
              store.dispatch({
                type: "SET_USER",
                payload: res.data.user
              })
             
            }
          })
          .catch((err) => {
            this.setState({ isLoading: false });
            err && err.response && console.log(err.response.data.error, "error")
           localStorage.removeItem("token");
            err && err.response.data && err.response.data.error && message.error(err.response.data.error)
            store.dispatch({
              type: "LOGOUT"
            })
        
          });
      }

    }

    render() {
      return (
        <div>
          {this.state.isLoading ? (
            <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <SpinnerCircularFixed style={{ margin: "0 auto" }} size={100} thickness={160} speed={100} color="#36D7B7" secondaryColor="rgba(0, 0, 0, .05)" />
            </div>
          ) : (
            <AuthComponent {...this.props} userData={this.state.userData} />
          )}
        </div>
      );
    }
  };
};
export default withAuth;
