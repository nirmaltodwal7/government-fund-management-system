import React from 'react'
import Navbar from './components/navbar'
import Mainroutes from './routes/Mainroutes'
import { AuthProvider } from './context/AuthContext'
import { GlobalFundsProvider } from './context/GlobalFundsContext'

const App = () => {
  return (
    <AuthProvider>
      <GlobalFundsProvider>
        <div>
          <Navbar/>
          <Mainroutes/>
        </div>
      </GlobalFundsProvider>
    </AuthProvider>
  )
}

export default App