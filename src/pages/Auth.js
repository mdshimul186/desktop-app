import { Alert, message, Spin } from 'antd'
import React, { useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import validator from 'validator'
import { useHistory } from 'react-router-dom'
import { loadChats, getOnlines, loadNotifications } from '../actions/default'
import { useDispatch } from 'react-redux'





function Auth() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loginErrors, setLoginErrors] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const history = useHistory()
    const dispatch = useDispatch()

    const sendNoti = () => {
        window.electron.auth.reload()
    }

    const loginValidator = (email, password) => {
        let error = {}
        if (!email) {
            error.email = 'Enter your email'
        } else if (!validator.isEmail(email)) {
            error.email = 'Enter your valid email'
        }

        if (!password) {
            error.password = "Enter your password"
        } else if (password.length < 6) {
            error.password = "Password must be six digit long"
        }

        return {
            error,
            isError: Object.keys(error).length == 0
        }
    }

    const handleLogin = (e) => {
        e.preventDefault()
        const validate = loginValidator(email, password)

        if (!validate.isError) {
            return setLoginErrors(validate.error)
        }

        setLoginErrors(null)
        setIsLoading(true)
        axios.post('/user/login', { email, password })
            .then(res => {
                let { isOtpSend, success, token } = res.data
                if (isOtpSend) {
                    // return sendOtpData({ email: loginData.email })
                    return message.error("OTP is not verified")

                }
                if (res.data.success) {
                    localStorage.setItem("token", `Bearer ${res.data.token}`)
                    //window.electron.auth.setCookie()
                    //Cookies.set("ts4u_token", `Bearer ${res.data.token}`);
                    // message.success("Logged in successfully")
                    // axios.defaults.headers.common = {
                    //     Authorization: `Bearer ${res.data.token}`,
                    // };
                    // dispatch(loadChats())
                    // dispatch(loadNotifications())
                    // dispatch(getOnlines())
                    // dispatch({
                    //     type: "SET_USER",
                    //     payload: res.data.user
                    // })
                    // history.push('/chat')
                    window.electron.auth.reload()

                }
                setIsLoading(false)
            })
            .catch(err => {
                console.log(err);
                err && err.response && setLoginErrors(err.response.data)
                setIsLoading(false)
            })
    }

    const openGoogleAuth = () => {
        window.electron.openExternalLink.open('https://ts4u.us/authorize-app')
    }
    return (
        <div className="auth">
            <div className="login-form">
                <form>
                    <h1>Login</h1>
                    {
                        loginErrors && loginErrors.error && <Alert style={{ margin: "10px" }} message={loginErrors.error} type="error" />
                    }
                    <div className="content">
                        <div className="input-field">
                            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" autocomplete="nope" />
                            {loginErrors?.email && <div className="error error-txt">{loginErrors.email}</div>}
                        </div>
                        <div className="input-field">
                            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" autocomplete="new-password" />
                            {loginErrors?.password && <div className="error error-txt">{loginErrors.password}</div>}
                        </div>
                        {/* <a href="#" className="link">Forgot Your Password?</a> */}
                    </div>
                    <div className="action">
                        {/* <button>Register</button> */}
                        <button disabled={isLoading} onClick={(e) => handleLogin(e)}> {isLoading && <Spin />}Sign in</button>
                    </div>
                </form>
                <div onClick={() => openGoogleAuth()} className="google-btn">
                    <div className="google-icon-wrapper">
                        <img className="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" />
                    </div>
                    <p className="btn-text"><b>Sign in with google</b></p>
                </div>
            </div>
        </div>
    )
}

export default Auth
