import './page.css'
import { loadAllAssets, type GameImages } from './assets/AssetLoader'
import { GameController } from './game/GameController'
import { TypeSound } from './engine/TypeSound'

const canvasEl = document.getElementById('game')
if (!(canvasEl instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element #game not found')
}
const canvas = canvasEl

const statusEl = document.getElementById('game-status')
const soundToggleEl = document.getElementById('sound-toggle')
const soundToggleLabelEl = document.getElementById('sound-toggle-label')
const traySoundToggleEl = document.getElementById('tray-sound-toggle')
const clockEl = document.getElementById('win98-clock')

const desktopEl = document.getElementById('win98-desktop')
const windowEl = document.getElementById('win98-window')
const taskMfEl = document.getElementById('win98-task-mf')
const closeBtnEl = document.getElementById('win98-close-btn')
const desktopLaunchEl = document.getElementById('desktop-launch-mf')
const startBtnEl = document.getElementById('win98-start-btn')
const startMenuEl = document.getElementById('win98-start-menu')
const startLaunchEl = document.getElementById('start-launch-mf')

canvas.width = 650
canvas.height = 500

const ctx = canvas.getContext('2d')
function clearCanvas(): void {
  if (ctx) {
    ctx.fillStyle = '#E0F7FF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}
clearCanvas()

let isSoundEnabled = true
function setSoundEnabled(enabled: boolean): void {
  isSoundEnabled = enabled
  TypeSound.setMasterVolume(enabled ? 0.1 : 0)

  if (soundToggleEl instanceof HTMLButtonElement) {
    soundToggleEl.setAttribute('aria-pressed', String(enabled))
  }
  if (soundToggleLabelEl) {
    soundToggleLabelEl.textContent = enabled ? '効果音 ON' : '効果音 OFF'
  }
  if (traySoundToggleEl instanceof HTMLButtonElement) {
    traySoundToggleEl.setAttribute('aria-pressed', String(enabled))
  }
}

for (const btn of [soundToggleEl, traySoundToggleEl]) {
  if (btn instanceof HTMLButtonElement) {
    btn.addEventListener('click', () => {
      setSoundEnabled(!isSoundEnabled)
      btn.blur()
    })
  }
}

let loadedImages: GameImages | null = null
let activeGame: GameController | null = null
let isWindowOpen = true
let isStartMenuOpen = false

function setStartMenuOpen(open: boolean): void {
  isStartMenuOpen = open
  if (startMenuEl) {
    startMenuEl.hidden = !open
  }
  if (startBtnEl instanceof HTMLButtonElement) {
    startBtnEl.setAttribute('aria-expanded', String(open))
  }
}

function launchGame(): void {
  setStartMenuOpen(false)
  isWindowOpen = true
  desktopEl?.classList.remove('is-app-closed')
  if (windowEl) windowEl.hidden = false
  if (taskMfEl) taskMfEl.hidden = false

  if (activeGame) return
  if (loadedImages) {
    if (statusEl) {
      statusEl.hidden = true
    }
    clearCanvas()
    activeGame = new GameController(canvas, loadedImages)
    activeGame.start()
  }
}

function closeGame(): void {
  setStartMenuOpen(false)
  isWindowOpen = false
  if (activeGame) {
    activeGame.destroy()
    activeGame = null
  }
  if (windowEl) windowEl.hidden = true
  if (taskMfEl) taskMfEl.hidden = true
  desktopEl?.classList.add('is-app-closed')
}

if (closeBtnEl instanceof HTMLButtonElement) {
  closeBtnEl.addEventListener('click', () => {
    closeGame()
    closeBtnEl.blur()
  })
}

if (desktopLaunchEl instanceof HTMLButtonElement) {
  desktopLaunchEl.addEventListener('click', () => {
    launchGame()
    desktopLaunchEl.blur()
  })
}

if (startBtnEl instanceof HTMLButtonElement) {
  startBtnEl.addEventListener('click', () => {
    setStartMenuOpen(!isStartMenuOpen)
    if (!isStartMenuOpen) {
      startBtnEl.blur()
    }
  })
}

if (startLaunchEl instanceof HTMLButtonElement) {
  startLaunchEl.addEventListener('click', () => {
    launchGame()
    startLaunchEl.blur()
  })
}

document.addEventListener('click', (e) => {
  if (!isStartMenuOpen) return
  const target = e.target
  if (
    target instanceof Node &&
    !startMenuEl?.contains(target) &&
    !startBtnEl?.contains(target)
  ) {
    setStartMenuOpen(false)
  }
})

document.addEventListener(
  'keydown',
  (e) => {
    if (isStartMenuOpen && e.key === 'Escape') {
      setStartMenuOpen(false)
      e.preventDefault()
      e.stopPropagation()
    }
  },
  true,
)

function updateClock(): void {
  if (!clockEl) return
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  clockEl.textContent = `${hours}:${minutes}`
}

updateClock()
const clockTimer = window.setInterval(updateClock, 15000)
window.addEventListener('pagehide', () => {
  activeGame?.destroy()
  activeGame = null
  window.clearInterval(clockTimer)
})

loadAllAssets()
  .then((images) => {
    loadedImages = images
    if (isWindowOpen) {
      launchGame()
    }
  })
  .catch((err) => {
    console.error('アセットの読み込みに失敗しました:', err)
    if (statusEl) {
      statusEl.textContent = 'アセットの読み込みに失敗しました。ページを再読み込みしてください。'
      statusEl.classList.add('mf-status--error')
      statusEl.hidden = false
    }
  })
