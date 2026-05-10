import { BrowserRouter } from 'react-router-dom'
import { Toaster } from './components/common/Toast'
import AppRouter from './router'

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
