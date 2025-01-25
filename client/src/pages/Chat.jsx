import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Chat = () => {
  const { user, logoutUser } = useContext(AuthContext)

  return (
    <div>
      <h1 className='text-black'>Chat by {user?.name}</h1>

      <Link to="/" onClick={() => logoutUser()}>
        Logout
      </Link>
    </div>
  )
}

export default Chat
