import React, { useRef, useState } from "react"
import Confetti from "react-confetti"

const MAX_FINGERS = 6
const RIPPLE_SIZE = 100 // px

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export default function App() {
  const [touches, setTouches] = useState({})
  const [winnerId, setWinnerId] = useState(null)
  const [timerId, setTimerId] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const containerRef = useRef(null)

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
      setShowConfetti(false)
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
        setShowConfetti(true)
        vibrate([0, 300])
        setTimeout(() => setShowConfetti(false), 1500)
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
      {Object.entries(touches).map(([id, t]) => {
        const isWinner = id === winnerId
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
            <span className={`absolute left-2 top-2 rounded-full border-4 border-cyan-400 opacity-80 w-[88px] h-[88px]`} />
            {/* Vinner-effekt: Stor ring og konfetti */}
            {isWinner && (
              <>
                <span className="absolute left-[-36px] top-[-36px] rounded-full border-[14px] border-pink-500 animate-bounce shadow-2xl w-[172px] h-[172px] opacity-90 z-10" />
                {showConfetti && (
                  <Confetti
                    numberOfPieces={80}
                    width={200}
                    height={200}
                    recycle={false}
                    run={true}
                    initialVelocityY={10}
                    style={{
                      position: "absolute",
                      left: -32,
                      top: -32,
                      pointerEvents: "none",
                      width: 200,
                      height: 200,
                      zIndex: 20
                    }}
                  />
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
