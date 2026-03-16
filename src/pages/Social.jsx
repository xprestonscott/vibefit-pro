import { useState, useEffect, useRef } from 'react'
import {
  Search, UserPlus, UserCheck, Users, Heart,
  Send, Bell, X, Check, Loader, MessageCircle,
  ArrowLeft, Trash2, MapPin,
} from 'lucide-react'
import { auth, db } from '../utils/firebase'
import { storage, KEYS } from '../utils/storage'
import {
  saveUserProfile, getAllUsers, searchUsers,
  sendFriendRequest, acceptFriendRequest, declineFriendRequest,
  removeFriend, getFriends, listenForRequests,
  postToFeed, listenToFeed, toggleLike, deletePost,
  sendMessage, listenToMessages, getFriendStatus,
} from '../utils/social'

function getMyUid() {
  return auth.currentUser?.uid || localStorage.getItem('vf_uid') || (() => {
    const id = 'user_' + Math.random().toString(36).slice(2,10)
    localStorage.setItem('vf_uid', id)
    return id
  })()
}

function timeAgo(ts) {
  if (!ts) return 'just now'
  const ms = typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now()
  const s  = Math.floor((Date.now() - ms) / 1000)
  if (s < 60)   return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function Avatar({ name, size=40, color='#39FF14' }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:size*.25,
      background:`linear-gradient(135deg, ${color}22, ${color}44)`,
      border:`1px solid ${color}44`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*.4, fontWeight:800, color, flexShrink:0,
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

// ── Chat window ───────────────────────────────────────────────
function ChatWindow({ friend, myUid, myName, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef()

  useEffect(() => {
    const unsub = listenToMessages(myUid, friend.uid, msgs => {
      setMessages(msgs)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100)
    })
    return () => unsub()
  }, [friend.uid])

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    await sendMessage(myUid, myName, friend.uid, text.trim())
    setText('')
    setSending(false)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(8,8,16,.95)', backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16,
    }}>
      <div style={{
        background:'#141422', border:'1px solid #252540',
        borderRadius:20, width:'100%', maxWidth:480,
        height:'85vh', display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{padding:'16px 20px', borderBottom:'1px solid #252540', display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#6B6B8A',padding:4}}>
            <ArrowLeft size={18}/>
          </button>
          <Avatar name={friend.name} size={36}/>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700}}>{friend.name}</div>
            <div style={{fontSize:11,color:'#6B6B8A'}}>{friend.goal || 'VibeFit user'}</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10}}>
          {messages.length === 0 && (
            <div style={{textAlign:'center', padding:'40px 0', color:'#6B6B8A'}}>
              <div style={{fontSize:32,marginBottom:10}}>👋</div>
              <div style={{fontSize:14}}>Say hi to {friend.name}!</div>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.fromUid === myUid
            return (
              <div key={msg.id} style={{display:'flex', justifyContent:isMe?'flex-end':'flex-start'}}>
                <div style={{
                  maxWidth:'75%', padding:'10px 14px', borderRadius:isMe?'16px 16px 4px 16px':'16px 16px 16px 4px',
                  background:isMe?'linear-gradient(135deg,#39FF14,#00C851)':'#1C1C2E',
                  color:isMe?'#080810':'#F0F0FF',
                  fontSize:14, lineHeight:1.5,
                }}>
                  {msg.text}
                  <div style={{fontSize:10,marginTop:4,opacity:.6,textAlign:'right'}}>
                    {timeAgo(msg.createdAt)}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{padding:'12px 16px', borderTop:'1px solid #252540', display:'flex', gap:10, flexShrink:0}}>
          <input
            className="vf-input"
            style={{flex:1, fontSize:14}}
            placeholder={`Message ${friend.name}...`}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button className="btn-primary" style={{padding:'10px 16px',flexShrink:0}} onClick={handleSend} disabled={!text.trim()||sending}>
            {sending ? <div style={{width:14,height:14,border:'2px solid rgba(8,8,16,.3)',borderTopColor:'#080810',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : <Send size={15}/>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function Social() {
  const user    = storage.get(KEYS.USER) || {}
  const myUid   = getMyUid()
  const myName  = user.name || auth.currentUser?.displayName || 'Athlete'

  const [tab, setTab]             = useState('feed')
  const [feed, setFeed]           = useState([])
  const [friends, setFriends]     = useState([])
  const [requests, setRequests]   = useState([])
  const [discover, setDiscover]   = useState([])
  const [searchQ, setSearchQ]     = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [searching, setSearching] = useState(false)
  const [postText, setPostText]   = useState('')
  const [posting, setPosting]     = useState(false)
  const [statuses, setStatuses]   = useState({})
  const [loading, setLoading]     = useState(true)
  const [notification, setNotif]  = useState(null)
  const [chatWith, setChatWith]   = useState(null)
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768)
  const searchRef = useRef()

  // Register this user
  useEffect(() => {
    if (user.name) saveUserProfile(myUid, { ...user, uid: myUid })
  }, [])

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Load friends
  useEffect(() => {
    getFriends(myUid).then(f => { setFriends(f); setLoading(false) })
  }, [])

  // Real-time friend requests
  useEffect(() => {
    const unsub = listenForRequests(myUid, reqs => {
      setRequests(reqs)
      if (reqs.length > 0) setNotif(`${reqs.length} new friend request${reqs.length>1?'s':''}`)
    })
    return () => unsub()
  }, [])

  // Real-time feed
  useEffect(() => {
    const unsub = listenToFeed(posts => setFeed(posts))
    return () => unsub()
  }, [])

  // Load discover users
  useEffect(() => {
    if (tab === 'discover') {
      getAllUsers(myUid).then(async users => {
        const withStatus = await Promise.all(users.map(async u => ({
          ...u,
          status: await getFriendStatus(myUid, u.uid)
        })))
        setDiscover(withStatus)
      })
    }
  }, [tab])

  // Search
  useEffect(() => {
    if (searchQ.length < 2) { setSearchRes([]); return }
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchUsers(searchQ)
      const filtered = results.filter(u => u.uid !== myUid)
      const withStatus = await Promise.all(filtered.map(async u => ({
        ...u,
        status: await getFriendStatus(myUid, u.uid)
      })))
      setSearchRes(withStatus)
      setSearching(false)
    }, 400)
  }, [searchQ])

  async function handleSendRequest(toUser) {
    await sendFriendRequest(myUid, myName, toUser.uid)
    setStatuses(s => ({...s, [toUser.uid]:'pending'}))
    setDiscover(prev => prev.map(u => u.uid===toUser.uid?{...u,status:'pending'}:u))
    setSearchRes(prev => prev.map(u => u.uid===toUser.uid?{...u,status:'pending'}:u))
  }

  async function handleAccept(req) {
    await acceptFriendRequest(req.id, myUid, req.fromUid)
    setRequests(prev => prev.filter(r => r.id!==req.id))
    const updated = await getFriends(myUid)
    setFriends(updated)
  }

  async function handleDecline(req) {
    await declineFriendRequest(req.id)
    setRequests(prev => prev.filter(r => r.id!==req.id))
  }

  async function handleRemoveFriend(friendUid) {
    if (!window.confirm('Remove this friend?')) return
    await removeFriend(myUid, friendUid)
    setFriends(prev => prev.filter(f => f.uid!==friendUid))
  }

  async function handlePost() {
    if (!postText.trim() || posting) return
    setPosting(true)
    await postToFeed(myUid, myName, postText.trim())
    setPostText('')
    setPosting(false)
  }

  async function handleLike(postId) {
    await toggleLike(postId, myUid)
  }

  async function handleDeletePost(postId) {
    await deletePost(postId)
  }

  function UserCard({ u, onMessage }) {
    const status = u.status || statuses[u.uid] || 'none'
    return (
      <div style={{background:'#141422',border:`1px solid ${status==='friends'?'rgba(57,255,20,.2)':'#252540'}`,borderRadius:16,padding:20,transition:'all .2s'}}>
        <div style={{display:'flex',gap:12,marginBottom:14,alignItems:'flex-start'}}>
          <Avatar name={u.name} size={48}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{u.name}</div>
            {u.goal && <div style={{fontSize:12,color:'#6B6B8A',marginBottom:6}}>{u.goal}</div>}
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {u.experience && <span className="badge badge-green" style={{fontSize:10}}>{u.experience}</span>}
              {u.activity   && <span className="badge badge-cyan"  style={{fontSize:10}}>{u.activity.split(' ')[0]}</span>}
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {status === 'friends' ? (
            <>
              <button className="btn-primary" style={{flex:1,justifyContent:'center',fontSize:13}} onClick={() => onMessage && onMessage(u)}>
                <MessageCircle size={13}/> Message
              </button>
              <button className="btn-ghost" style={{padding:'9px 12px'}} onClick={() => handleRemoveFriend(u.uid)}>
                <X size={14}/>
              </button>
            </>
          ) : status === 'pending' ? (
            <button className="btn-ghost" style={{flex:1,justifyContent:'center',color:'#6B6B8A',cursor:'default'}}>
              <Loader size={13}/> Request Sent
            </button>
          ) : status === 'inbound' ? (
            <button className="btn-primary" style={{flex:1,justifyContent:'center',fontSize:13}} onClick={() => {
              const req = requests.find(r => r.fromUid===u.uid)
              if (req) handleAccept(req)
            }}>
              <Check size={13}/> Accept Request
            </button>
          ) : (
            <button className="btn-primary" style={{flex:1,justifyContent:'center',fontSize:13}} onClick={() => handleSendRequest(u)}>
              <UserPlus size={13}/> Add Friend
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {chatWith && (
        <ChatWindow
          friend={chatWith}
          myUid={myUid}
          myName={myName}
          onClose={() => setChatWith(null)}
        />
      )}

      {notification && (
        <div style={{position:'fixed',top:20,right:20,zIndex:999,background:'#141422',border:'1px solid rgba(57,255,20,.4)',borderRadius:12,padding:'12px 16px',display:'flex',gap:10,alignItems:'center',boxShadow:'0 8px 32px rgba(0,0,0,.4)'}}>
          <Bell size={15} style={{color:'#39FF14'}}/>
          <span style={{fontSize:13,fontWeight:600}}>{notification}</span>
          <button style={{background:'none',border:'none',cursor:'pointer',color:'#6B6B8A'}} onClick={()=>setNotif(null)}><X size={14}/></button>
        </div>
      )}

      <div className="anim-up" style={{marginBottom:28}}>
        <h1 className="font-display" style={{fontSize:isMobile?36:48,margin:0}}>
          COMMUNITY <span className="gradient-text">HUB</span>
        </h1>
        <p style={{color:'#6B6B8A',marginTop:6}}>Real users · Live feed · Direct messages</p>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[
          {icon:'🤝',label:'Friends',    val:friends.length,                             color:'#39FF14'},
          {icon:'📬',label:'Requests',   val:requests.length,                            color:requests.length>0?'#FF6B35':'#6B6B8A'},
          {icon:'📱',label:'Feed Posts', val:feed.length,                                color:'#00E5FF'},
          {icon:'🌍',label:'You',        val:auth.currentUser?'Online':'Local',          color:'#8B5CF6'},
        ].map(s => (
          <div key={s.label} className="stat-card" style={{textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.val}</div>
            <div style={{fontSize:11,color:'#6B6B8A'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        {[
          {id:'feed',     l:'📱 Feed'},
          {id:'friends',  l:`🤝 Friends (${friends.length})`},
          {id:'requests', l:`📬 Requests${requests.length>0?` (${requests.length})`:''}`},
          {id:'discover', l:'🔍 Find People'},
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={tab===t.id?'btn-primary':'btn-ghost'}
            style={{padding:'8px 16px',fontSize:13,position:'relative'}}>
            {t.l}
            {t.id==='requests'&&requests.length>0&&(
              <div style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#FF6B35',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
                {requests.length}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── FEED TAB ── */}
      {tab === 'feed' && (
        <div style={{maxWidth:600}}>
          {/* Post composer */}
          <div style={{background:'#141422',border:'1px solid #252540',borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{display:'flex',gap:12,marginBottom:12}}>
              <Avatar name={myName} size={38}/>
              <textarea
                className="vf-input"
                style={{flex:1,minHeight:80,resize:'none',fontSize:14,lineHeight:1.6}}
                placeholder={`What's your win today, ${myName?.split(' ')[0]}? Share a PR, workout, or update...`}
                value={postText}
                onChange={e=>setPostText(e.target.value)}
              />
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-ghost" style={{padding:'6px 12px',fontSize:12}} onClick={()=>setPostText(postText+'💪 New PR: ')}>💪 PR</button>
                <button className="btn-ghost" style={{padding:'6px 12px',fontSize:12}} onClick={()=>setPostText(postText+'🔥 Finished ')}>🔥 Workout</button>
                <button className="btn-ghost" style={{padding:'6px 12px',fontSize:12}} onClick={()=>setPostText(postText+'🎯 Goal: ')}>🎯 Goal</button>
              </div>
              <button className="btn-primary" style={{padding:'9px 20px',fontSize:13}} disabled={posting||!postText.trim()} onClick={handlePost}>
                {posting?<div style={{width:14,height:14,border:'2px solid rgba(8,8,16,.3)',borderTopColor:'#080810',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>:<><Send size={13}/>Post</>}
              </button>
            </div>
          </div>

          {feed.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'#141422',border:'1px solid #252540',borderRadius:16}}>
              <div style={{fontSize:48,marginBottom:12}}>📱</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Feed is empty</div>
              <div style={{color:'#6B6B8A',fontSize:14}}>Be the first to post! Share a workout win or tag a friend.</div>
            </div>
          ) : feed.map(post => (
            <div key={post.id} style={{background:'#141422',border:'1px solid #252540',borderRadius:16,padding:20,marginBottom:10,transition:'border-color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,229,255,.15)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#252540'}>
              <div style={{display:'flex',gap:12,marginBottom:12}}>
                <Avatar name={post.name} size={40}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700}}>{post.name}</div>
                      <div style={{fontSize:11,color:'#6B6B8A'}}>{timeAgo(post.createdAt)}</div>
                    </div>
                    {post.uid === myUid && (
                      <button style={{background:'none',border:'none',cursor:'pointer',color:'#6B6B8A',padding:4,transition:'color .15s'}}
                        onMouseEnter={e=>e.target.style.color='#FF6B35'} onMouseLeave={e=>e.target.style.color='#6B6B8A'}
                        onClick={()=>handleDeletePost(post.id)}>
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <p style={{margin:'0 0 14px',fontSize:14,lineHeight:1.7,color:'#F0F0FF'}}>{post.text}</p>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <button style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,color:post.likes?.includes(myUid)?'#FF6B35':'#6B6B8A',transition:'color .15s'}} onClick={()=>handleLike(post.id)}>
                  <Heart size={14} fill={post.likes?.includes(myUid)?'#FF6B35':'none'}/>
                  {post.likes?.length||0}
                </button>
                {post.uid !== myUid && (
                  <button style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#6B6B8A',transition:'color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.color='#00E5FF'} onMouseLeave={e=>e.currentTarget.style.color='#6B6B8A'}
                    onClick={() => { const f=friends.find(f=>f.uid===post.uid); if(f) setChatWith(f) }}>
                    <MessageCircle size={14}/>
                    {friends.find(f=>f.uid===post.uid)?'Message':''}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FRIENDS TAB ── */}
      {tab === 'friends' && (
        <div>
          {loading ? (
            <div style={{textAlign:'center',padding:60}}><div className="spinner" style={{margin:'0 auto'}}/></div>
          ) : friends.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'#141422',border:'1px solid #252540',borderRadius:16}}>
              <div style={{fontSize:48,marginBottom:16}}>🤝</div>
              <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>No friends yet</div>
              <div style={{color:'#6B6B8A',marginBottom:24}}>Find other athletes and send them a friend request</div>
              <button className="btn-primary" onClick={()=>setTab('discover')}><Search size={14}/>Find People</button>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:14}}>
              {friends.map(f => (
                <UserCard key={f.uid} u={{...f,status:'friends'}} onMessage={u=>setChatWith(u)}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REQUESTS TAB ── */}
      {tab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'#141422',border:'1px solid #252540',borderRadius:16}}>
              <div style={{fontSize:48,marginBottom:16}}>📬</div>
              <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>No pending requests</div>
              <div style={{color:'#6B6B8A'}}>Friend requests appear here in real-time</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:540}}>
              {requests.map(req => (
                <div key={req.id} style={{background:'#141422',border:'1px solid rgba(57,255,20,.2)',borderRadius:16,padding:20,display:'flex',alignItems:'center',gap:16}}>
                  <Avatar name={req.fromName} size={48}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700}}>{req.fromName}</div>
                    <div style={{fontSize:12,color:'#6B6B8A',marginTop:2}}>Wants to be your fitness buddy</div>
                  </div>
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button className="btn-danger" style={{padding:'8px 12px'}} onClick={()=>handleDecline(req)}>
                      <X size={15}/>
                    </button>
                    <button className="btn-primary" style={{padding:'8px 16px',fontSize:13}} onClick={()=>handleAccept(req)}>
                      <Check size={14}/> Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DISCOVER TAB ── */}
      {tab === 'discover' && (
        <div>
          <div style={{maxWidth:480,marginBottom:20}}>
            <div style={{position:'relative'}}>
              <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#6B6B8A'}}/>
              <input className="vf-input" style={{paddingLeft:38,fontSize:14}} placeholder="Search by name..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
              {searching && <div style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:14,height:14,border:'2px solid #252540',borderTopColor:'#39FF14',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>}
            </div>
          </div>

          {/* Search results */}
          {searchQ.length >= 2 && (
            <div>
              {searchRes.length === 0 && !searching && (
                <div style={{textAlign:'center',padding:40,color:'#6B6B8A'}}>No users found for "{searchQ}"</div>
              )}
              <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:14}}>
                {searchRes.map(u => <UserCard key={u.uid} u={u} onMessage={u=>setChatWith(u)}/>)}
              </div>
            </div>
          )}

          {/* All users when not searching */}
          {searchQ.length < 2 && (
            <div>
              <div style={{fontSize:13,color:'#6B6B8A',marginBottom:16}}>
                {discover.filter(u=>u.uid!==myUid).length} athletes on VibeFit Pro
              </div>
              {discover.length === 0 ? (
                <div style={{textAlign:'center',padding:'60px 20px',background:'#141422',border:'2px dashed #252540',borderRadius:16}}>
                  <div style={{fontSize:48,marginBottom:12}}>👥</div>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>No other users yet</div>
                  <div style={{color:'#6B6B8A',fontSize:14,maxWidth:320,margin:'0 auto'}}>
                    Share your app link with friends so they can sign up and appear here!
                  </div>
                  <button className="btn-primary" style={{marginTop:20}} onClick={()=>navigator.clipboard.writeText('https://vibefit-pro.netlify.app').then(()=>alert('Link copied!'))}>
                    📋 Copy App Link
                  </button>
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:14}}>
                  {discover.filter(u=>u.uid!==myUid).map(u => <UserCard key={u.uid} u={u} onMessage={u=>setChatWith(u)}/>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
