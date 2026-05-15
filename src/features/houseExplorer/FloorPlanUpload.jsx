import { useRef } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import './FloorPlanUpload.css';

export default function FloorPlanUpload() {
  const { home, dispatch, actions } = useHome();
  const inputRef = useRef(null);
  if (!home.homeType) return null;

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => dispatch(actions.setFloorPlan(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="card floorplan">
      <h3>Floor plan (optional)</h3>
      <p style={{ color: 'var(--text-dim)', margin: '4px 0 10px' }}>
        Upload the customer's floor plan as a reference while shaping the rooms.
      </p>

      {!home.floorPlanImage && (
        <div className="floorplan-drop" onClick={() => inputRef.current.click()}>
          Click to upload an image of the floor plan
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFile}
      />

      {home.floorPlanImage && (
        <div className="floorplan-preview">
          <img src={home.floorPlanImage} alt="Uploaded floor plan reference" />
          <button
            type="button"
            className="floorplan-clear"
            onClick={() => dispatch(actions.setFloorPlan(null))}
          >
            Remove floor plan
          </button>
        </div>
      )}
    </div>
  );
}
