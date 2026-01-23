import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MyCalendar from './components/Calendar.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)