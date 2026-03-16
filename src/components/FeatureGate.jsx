import { useState } from 'react'
import { checkLimit, canUse, incrementUsage } from '../utils/subscription'
import UpgradeModal from './UpgradeModal'

// Wrap any feature with this component to gate it
export default function FeatureGate({ feature, children, onAllowed }) {
  const [showModal, setShowModal] = useState(false)

  function handleClick() {
    const allowed = feature.includes('Per') ? checkLimit(feature) : canUse(feature)
    if (!allowed) {
      setShowModal(true)
      return
    }
    if (feature.includes('Per')) incrementUsage(feature)
    if (onAllowed) onAllowed()
  }

  return (
    <>
      {showModal && <UpgradeModal feature={feature} onClose={() => setShowModal(false)}/>}
      <div onClick={handleClick} style={{ display:'contents' }}>
        {children}
      </div>
    </>
  )
}
