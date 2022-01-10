import {combineReducers} from 'redux'
import authReducers from './authReducer'
import chatReducer from './chatReducer'
import notificationReducer from './notificationReducer'

const rootReducer = combineReducers({
    auth: authReducers,
    chat:chatReducer,
    notification:notificationReducer
})

export default rootReducer