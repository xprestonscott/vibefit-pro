import { useState, useEffect } from 'react'
import { LayoutDashboard, Dumbbell, Apple, Target, Scan, Users, CreditCard,
  Settings, Zap, ChevronRight, Bell, LogOut, Menu, X, ChevronLeft } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'

const NAV = [
  { id:'dashboard',    label:'Dashboard',   icon:LayoutDashboard },
  { id:'workout',      label:'Workout Plan', icon:Dumbbell },
  { id:'calories',     label:'Nutrition',    icon:Apple },
  { id:'goals',        label:'Goals',        icon:Target },
  { id:'physique',     label:'AI Physique',  icon:Scan },
  { id:'social',       label:'Community',    icon:Users },
]

export default function Sidebar({ currentPage, setCurrentPage, user }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const streak = storage.get(KEYS.STREAK) || 0
  const plan   = storage.get(KEYS.WORKOUTS)

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function navigate(id) {
    setCurrentPage(id)
    if (isMobile) setMobileOpen(false)
  }

  const sidebarWidth = collapsed ? 68 : 260

  return (
    <>
      {/* ── Mobile top bar ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 56,
          background: 'var(--vf-bg2)', borderBottom: '1px solid var(--vf-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 200,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#39FF14,#00C851)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <div className="font-display" style={{ fontSize: 18 }}>VIBEFIT <span style={{ color: '#39FF14' }}>PRO</span></div>
          </div>
          <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-text)', padding: 8 }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      )}

      {/* ── Mobile overlay ── */}
      {isMobile && mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,16,.7)', zIndex: 149, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed',
        left: isMobile ? (mobileOpen ? 0 : -280) : 0,
        top: isMobile ? 56 : 0,
        bottom: 0,
        width: isMobile ? 260 : sidebarWidth,
        background: 'var(--vf-bg2)',
        borderRight: '1px solid var(--vf-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 150,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'left .3s ease, width .25s ease',
      }}>

        {/* ── Logo ── */}
        {!isMobile && (
          <div style={{ padding: collapsed ? '20px 0' : '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#39FF14,#00C851)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
                <div>
                  <div className="font-display" style={{ fontSize: 20, lineHeight: 1 }}>VIBEFIT <span style={{ color: '#39FF14' }}>PRO</span></div>
                  <div style={{ fontSize: 9, color: 'var(--vf-muted)', marginTop: 2 }}>AI FITNESS PLATFORM</div>
                </div>
              </div>
            )}
            {collapsed && (
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#39FF14,#00C851)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            )}
          </div>
        )}

        {/* ── Collapse toggle button ── */}
        {!isMobile && (
          <button onClick={() => setCollapsed(c => !c)} style={{
            position: 'absolute', top: 20, right: -12,
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--vf-card2)', border: '1px solid var(--vf-border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--vf-muted)', transition: 'all .2s', zIndex: 10,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#39FF14'; e.currentTarget.style.color = '#080810' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--vf-card2)'; e.currentTarget.style.color = 'var(--vf-muted)' }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}

        {/* ── Streak banner ── */}
        {!collapsed && (
          <div style={{ margin: '0 10px 12px', background: streak > 0 ? 'rgba(57,255,20,.08)' : 'var(--vf-card)', border: `1px solid ${streak > 0 ? 'rgba(57,255,20,.2)' : 'var(--vf-border)'}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{streak > 0 ? '🔥' : '🎯'}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: streak > 0 ? '#39FF14' : 'var(--vf-text)' }}>
                {streak > 0 ? `${streak}-Day Streak!` : 'Start your streak'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--vf-muted)' }}>
                {streak > 0 ? 'Keep it going' : 'Complete a workout'}
              </div>
            </div>
          </div>
        )}

        {collapsed && streak > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>🔥</span>
          </div>
        )}

        {/* ── Active program ── */}
        {!collapsed && plan && (
          <div style={{ margin: '0 10px 10px', background: 'var(--vf-card)', border: '1px solid var(--vf-border)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, color: 'var(--vf-muted)', letterSpacing: '1px', marginBottom: 3 }}>ACTIVE PROGRAM</div>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.planName}</div>
            <div style={{ fontSize: 10, color: 'var(--vf-muted)' }}>{plan.daysPerWeek}d/week · {plan.split}</div>
          </div>
        )}

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: collapsed ? '0 6px' : '0' }}>
          {!collapsed && (
            <div style={{ fontSize: 9, color: 'var(--vf-muted)', letterSpacing: '1px', padding: '4px 22px 6px', fontWeight: 600 }}>MENU</div>
          )}
          {NAV.map(({ id, label, icon: Icon }) => (
            <div key={id}
              className={`sidebar-item ${currentPage === id ? 'active' : ''}`}
              style={collapsed ? { justifyContent: 'center', padding: '12px 0', margin: '2px 0', borderRadius: 10 } : {}}
              onClick={() => navigate(id)}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
              {!collapsed && currentPage === id && <ChevronRight size={13} style={{ opacity: .5 }} />}
            </div>
          ))}

          <div style={{ margin: collapsed ? '8px 6px' : '8px 12px', borderTop: '1px solid var(--vf-border)' }} />

          {/* Upgrade */}
          <div
            className={`sidebar-item ${currentPage === 'subscription' ? 'active' : ''}`}
            style={{
              background: 'rgba(57,255,20,.06)', border: '1px solid rgba(57,255,20,.2)', color: '#39FF14',
              ...(collapsed ? { justifyContent: 'center', padding: '12px 0', margin: '2px 0' } : {}),
            }}
            onClick={() => navigate('subscription')}
            title={collapsed ? 'Upgrade Pro' : undefined}
          >
            <Zap size={17} style={{ color: '#39FF14', flexShrink: 0 }} />
            {!collapsed && <span style={{ flex: 1, fontWeight: 600 }}>Upgrade Pro</span>}
            {!collapsed && <span className="badge badge-green" style={{ fontSize: 9 }}>PRO</span>}
          </div>

          {/* Settings */}
          <div
            className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}
            style={collapsed ? { justifyContent: 'center', padding: '12px 0', margin: '2px 0' } : {}}
            onClick={() => navigate('settings')}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ flex: 1 }}>Settings</span>}
          </div>
        </nav>

        {/* ── User profile ── */}
        <div style={{ margin: '10px', background: 'var(--vf-card)', border: '1px solid var(--vf-border)', borderRadius: 12, padding: collapsed ? '10px 0' : '12px' }}>
          {collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--vf-bg2),var(--vf-card2))', border: '1px solid var(--vf-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-muted)', padding: 4 }} title="Reset"
                onClick={() => { storage.clearAll(); window.location.reload() }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,rgba(57,255,20,.15),rgba(0,229,255,.1))', border: '1px solid rgba(57,255,20,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Athlete'}</div>
                  <div style={{ fontSize: 10, color: 'var(--vf-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.goal || 'No goal set'}</div>
                </div>
              </div>
              <button className="btn-danger" style={{ marginTop: 10, width: '100%', justifyContent: 'center', fontSize: 11, padding: '6px' }}
                onClick={() => { storage.clearAll(); window.location.reload() }}>
                <LogOut size={12} /> Reset & Start Over
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
