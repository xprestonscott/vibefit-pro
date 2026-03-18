import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight:'100vh', background:'#080810',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:32, textAlign:'center',
        }}>
          <div>
            <div style={{ fontSize:64, marginBottom:20 }}>⚡</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:36, marginBottom:12 }}>
              SOMETHING WENT WRONG
            </h2>
            <p style={{ color:'#6B6B8A', marginBottom:28, maxWidth:400, margin:'0 auto 28px' }}>
              VibeFit Pro hit an unexpected error. Your data is safe.
            </p>
            <button
              onClick={() => { this.setState({ hasError:false, error:null }); window.location.reload() }}
              style={{ background:'linear-gradient(135deg,#39FF14,#00C851)', color:'#080810', border:'none', borderRadius:10, padding:'12px 28px', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
