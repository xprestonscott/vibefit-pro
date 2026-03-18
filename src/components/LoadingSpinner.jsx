export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      minHeight:'100vh', background:'#080810',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:20,
    }}>
      <div style={{
        width:52, height:52,
        border:'4px solid #252540',
        borderTopColor:'#39FF14',
        borderRadius:'50%',
        animation:'spin 1s linear infinite',
      }}/>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color:'#6B6B8A', letterSpacing:'2px' }}>
        {message.toUpperCase()}
      </div>
    </div>
  )
}
