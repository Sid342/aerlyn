import { useHome } from '../../context/HomeContext.jsx';
import { BookButton } from '../marketing/Booking.jsx';
import './StickyAction.css';

// The one bar at the bottom of a phone screen: the next step for this visitor.
export default function StickyAction() {
  const { home } = useHome();
  return (
    <div className="sticky-action">
      {home.homeType ? <BookButton /> : <a className="btn" href="/#planner">Plan my home</a>}
    </div>
  );
}
