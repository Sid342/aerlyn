import { useEffect } from 'react';
import { useCart } from './CartContext.jsx';
import { cartLines, cartTotal, inr } from '../../lib/cart.js';
import { CHECKOUT_PATH } from '../../routes.js';
import './Cart.css';

export default function CartDrawer() {
  const { cart, open, closeCart, remove, clear } = useCart();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  const lines = cartLines(cart);

  return (
    <div className="cart-overlay" onClick={(e) => e.target === e.currentTarget && closeCart()}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="cart-head">
          <strong>Your Cart</strong>
          <button type="button" aria-label="Close cart" onClick={closeCart}>✕</button>
        </div>
        <div className="cart-items">
          {lines.length === 0 && <p className="cart-empty">Your cart is empty.</p>}
          {lines.map((l) => (
            <div key={l.id} className="cart-item">
              <div>{l.name}<br /><small>Qty {l.qty} · {inr(l.price)}</small></div>
              <div className="cart-item-end">
                {inr(l.lineTotal)}<br />
                <button type="button" onClick={() => remove(l.id)} aria-label={`Remove ${l.name}`}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-foot">
          <div className="cart-total">Total<span>{inr(cartTotal(lines))}</span></div>
          {lines.length > 0 && (
            <>
              <a className="btn-cta" href={CHECKOUT_PATH}>Checkout</a>
              <button type="button" className="cart-clear" onClick={clear}>Clear cart</button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
