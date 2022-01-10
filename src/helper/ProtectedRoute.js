import React from "react";
import { Redirect, Route } from "react-router-dom";
import {useSelector} from 'react-redux'
import Cookies from "js-cookie";

function ProtectedRoute({ component: Component, ...restOfProps }) {
    const {isAuthenticated} = useSelector(state => state.auth)
    const token = Cookies.get("ts4u_token");
  return (
    <Route
      {...restOfProps}
      render={(props) =>
        token ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
}

export default ProtectedRoute;
