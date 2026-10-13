import Shell from './Shell.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import TouchPlateDesigner from '../features/touchPlate/TouchPlateDesigner.jsx';
import './pages.css';

export default function PlateDesignerPage() {
  return (
    <Shell>
      <div className="page-wrap wide">
        <Breadcrumb current="Switch plate designer" />
        <TouchPlateDesigner />
        <p className="page-back"><a href="/#planner">Back to my plan</a></p>
      </div>
    </Shell>
  );
}
