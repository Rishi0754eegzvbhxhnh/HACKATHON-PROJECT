// Toast.jsx
export function Toast({ message, icon = '✅' }) {
  return (
    <div className="toast show">
      <span className="toast-icon">{icon}</span>
      <div>{message}</div>
    </div>
  )
}
export default Toast

// IconModeBar.jsx (separate default export below)
