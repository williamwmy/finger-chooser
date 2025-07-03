import React, { useRef, useState } from "react"

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
  const [selecting, setSelecting] = useState(false)
  const [timerId, setTimerId] = useState(null)
  const containerRef = useRef(null)

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
      setSelecting(false)
    }
  }

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

  function startSelection() {
    setSelecting(true)
    vibrate([70, 50, 70, 50, 70])
    setTimeout(() => {
      const keys = Object.keys(touches)
      if (keys.length > 0) {
        const id = getRandomItem(keys)
        setWinnerId(id)
        vibrate([0, 250])
      }
      setSelecting(false)
    }, 1000)
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-cyan-100 touch-none"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
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
            <span className={`absolute left-0 top-0 rounded-full bg-cyan-400 opacity-30 animate-ping w-full h-full`} />
            <span className={`absolute left-2 top-2 rounded-full border-4 ${id === winnerId
              ? "border-pink-500 animate-pulse shadow-xl"
              : "border-cyan-400 opacity-80"
              } w-[88px] h-[88px]`} />
            {id === winnerId && (
              <span className="absolute left-0 top-0 w-full h-full rounded-full border-8 border-pink-400 animate-pulse opacity-70" />
            )}
          </div>
        )
      })}
      {selecting && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border-8 border-cyan-500 animate-spin opacity-40" />
        </div>
      )}
    </div>
  )
}
