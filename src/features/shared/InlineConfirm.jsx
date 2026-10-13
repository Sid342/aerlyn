// Inline replacement for window.confirm, styled like the plan dock's notices.
// Render it right after the control that asked, so it is next in the tab order.
export default function InlineConfirm({ message, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel }) {
  return (
    <div className="inline-confirm" role="alert">
      <span>{message}</span>
      <button type="button" className="plan-notice-btn primary" onClick={onConfirm}>{confirmLabel}</button>
      <button type="button" className="plan-notice-btn" onClick={onCancel}>{cancelLabel}</button>
    </div>
  );
}
