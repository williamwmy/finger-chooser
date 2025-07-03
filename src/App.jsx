import React, { useRef, useState, useEffect } from "react"
import Confetti from "react-confetti"

const MAX_FINGERS = 6
const RIPPLE_SIZE = 100 // ripple-størrelse (bak fingeren)
const WINNER_RING_SIZE = 172 // px (må være lik her og i style under!)

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Hook for vindusstørrelse (for at konfetti dekker hele skjermen)
function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight])
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight])
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return size
}

export default function App() {
  const [touches, setTouches] = useState({})
  const [winnerId, setWinnerId] = useState(null)
  const [timerId, setTimerId] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const containerRef = useRef(null)
  const [width, height] = useWindowSize()

  // Touch: Legg til/følg fingre
  function handleTouchStart(e) {
    e.preventDefault()
    let newTouches = { ...touches }
    for (let touch of Array.from(e.changedTouches)) {
      if (Object.keys(newTouches).length < MAX_FINGERS && !(touch.identifier in newTouches)) {
        newTouches[touch.identifier] = {
          x: touch.clientX,
          y: touch.clientY,
        }
      }
    }
    if (Object.keys(touches).length === 0 && Object.keys(newTouches).length > 0) {
      startJoinTimeout()
    } else if (Object.keys(newTouches).length !== Object.keys(touches).length) {
      extendJoinTimeout()
    }
    setTouches(newTouches)
  }

  function handleTouchMove(e) {
    let newTouches = { ...touches }
    for (let touch of Array.from(e.changedTouches)) {
      if (touch.identifier in newTouches) {
        newTouches[touch.identifier] = {
          x: touch.clientX,
          y: touch.clientY,
        }
      }
    }
    setTouches(newTouches)
  }

  function handleTouchEnd(e) {
    let newTouches = { ...touches }
    for (let touch of Array.from(e.changedTouches)) {
      delete newTouches[touch.identifier]
    }
    setTouches(newTouches)
    if (Object.keys(newTouches).length === 0) {
      clearTimeout(timerId)
      setWinnerId(null)
      setShowConfetti(false) // Stopp konfetti straks alle fingre er løftet
    }
  }

  // Join-timerlogikk
  function startJoinTimeout() {
    clearTimeout(timerId)
    const id = setTimeout(() => {
      startSelection()
    }, 3000)
    setTimerId(id)
  }

  function extendJoinTimeout() {
    clearTimeout(timerId)
    const id = setTimeout(() => {
      startSelection()
    }, 3000)
    setTimerId(id)
  }

  // Trekker vinner og gir konfetti/vibrasjon
  function startSelection() {
    vibrate([70, 50, 70, 50, 70])
    setTimeout(() => {
      const keys = Object.keys(touches)
      if (keys.length > 0) {
        const id = getRandomItem(keys)
        setWinnerId(id)
        setShowConfetti(true) // Start konfetti
        vibrate([0, 300])
      }
    }, 400) // Kort pause før vinner-effekt
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-cyan-100 touch-none select-none"
      style={{ touchAction: "none", WebkitTapHighlightColor: "transparent" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Render finger-ripples uten vinner-ring */}
      {Object.entries(touches).map(([id, t]) => {
        const rippleStyle = {
          position: "absolute",
          left: t.x - RIPPLE_SIZE / 2,
          top: t.y - RIPPLE_SIZE / 2,
          width: RIPPLE_SIZE,
          height: RIPPLE_SIZE,
          pointerEvents: "none",
        }
        return (
          <div
            key={id}
            style={rippleStyle}
            className="pointer-events-none"
          >
            {/* Ripple-effekt under alle fingre */}
            <span className="absolute left-0 top-0 rounded-full bg-cyan-400 opacity-30 animate-ping w-full h-full" />
            {/* Standard ring */}
            <span className="absolute left-2 top-2 rounded-full border-4 border-cyan-400 opacity-80 w-[88px] h-[88px]" />
          </div>
        )
      })}

      {/* Vinner-ring tegnes separat, alltid sentrert */}
      {winnerId && touches[winnerId] && (
        <span
          className="absolute pointer-events-none z-20 rounded-full border-[14px] border-pink-500 shadow-2xl w-[172px] h-[172px] opacity-90 animate-bounce"
          style={{
            left: `${touches[winnerId].x - WINNER_RING_SIZE / 2}px`,
            top: `${touches[winnerId].y - WINNER_RING_SIZE / 2}px`
          }}
        />
      )}

      {/* Fullskjerm-konfetti */}
      {showConfetti && (
        <Confetti
          numberOfPieces={300}
          width={width}
          height={height}
          recycle={false}
          run={true}
          gravity={0.2}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 50
          }}
        />
      )}
    </div>
  )
}
