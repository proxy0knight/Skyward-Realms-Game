import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add error boundary for better debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #24243e, #302b63, #0f0c29)',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1>🎮 Skyward Realms</h1>
          <h2>Something went wrong!</h2>
          <p>An error occurred while loading the game.</p>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '10px', 
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Game
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)
})

// Initialize the app with error boundary
ReactDOM.createRoot(document.getElementById('root')).render(
  // Temporarily disable StrictMode to fix 3D rendering issue
  // <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  // </React.StrictMode>,
)
