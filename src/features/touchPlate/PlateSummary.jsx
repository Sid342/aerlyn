import { useRef, useState } from 'react';
import { describePlate } from '../../lib/plateConfig.js';
import { downloadPlatePdf, downloadPlateImage } from '../../lib/exportPlatePdf.js';
import { useDownload, PDF_FAILED } from '../../lib/useDownload.js';
import Plate from './Plate.jsx';

const POSITIONS = [['top-left', 'Top left'], ['top-right', 'Top right'], ['bottom-left', 'Bottom left'], ['bottom-right', 'Bottom right']];

// The reference's last step without its cart: the finished plate, what it is made of, the logo and
// remote options, and the downloads. The logo never leaves this component tree.
export default function PlateSummary({ config, roomName, logo, onLogo, onRemote }) {
  const plate = useRef(null);
  const [preview, setPreview] = useState(logo ? logo.src : null);
  const [position, setPosition] = useState(logo ? logo.position : 'top-left');
  const [fileError, setFileError] = useState(false);
  const [busy, setBusy] = useState(false);
  const during = (run) => async () => {
    setBusy(true);
    try { await run(); } finally { setBusy(false); }
  };
  const [pdf, pdfFailed] = useDownload(during(() => downloadPlatePdf(config, roomName, plate.current)));
  const [image, imageFailed] = useDownload(during(() => downloadPlateImage(config, plate.current)));
  const d = describePlate(config);
  const accessory = d.accessories[0];

  function onFile(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setFileError(!file.type.startsWith('image/'));
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function changePosition(next) {
    setPosition(next);
    if (logo) onLogo({ ...logo, position: next });
  }

  function clearLogo() {
    setPreview(null);
    setPosition('top-left');
    onLogo(null);
  }

  const rows = [
    ['Model', d.model], ['Material', d.material], ['Size', d.size],
    ['Accessory', accessory ? accessory.name : null],
    ['Panel colour', d.panel],
    ...(d.frame ? [['Frame colour', d.frame]] : []),
  ];

  return (
    <div className="tpd-summary">
      <div className="tpd-stage">
        <Plate config={config} logo={logo} plateRef={plate} />
      </div>

      <div className="tpd-summary-grid">
        <section className="tpd-box">
          <h3 className="tpd-side-title">Specification</h3>
          <dl className="tpd-spec">
            {rows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>
            ))}
            <div>
              <dt><label htmlFor="tpd-remote">Remote</label></dt>
              <dd>
                <select id="tpd-remote" className="tpd-select" value={config.remote ? 'yes' : 'no'} onChange={(e) => onRemote(e.target.value === 'yes')}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </dd>
            </div>
          </dl>
          {accessory && accessory.icons.length > 0 && (
            <>
              <h4 className="tpd-box-sub">Switch icons</h4>
              <ul className="tpd-icon-list">{accessory.icons.map((line) => <li key={line}>{line}</li>)}</ul>
            </>
          )}
        </section>

        <section className="tpd-box">
          <h3 className="tpd-side-title">Logo</h3>
          <div className="tpd-logo-row">
            <label className="tpd-upload">
              <input type="file" accept="image/*" onChange={onFile} />
              <span>{preview ? 'Choose another image' : 'Upload an image'}</span>
              <small>PNG, JPG or GIF. It stays on this device.</small>
            </label>
            {preview && <img className="tpd-logo-preview" src={preview} alt="Logo preview" />}
          </div>
          {fileError && <p className="tpd-notice" role="alert">That file is not an image.</p>}
          <label className="tpd-field">
            Logo position
            <select className="tpd-select" value={position} onChange={(e) => changePosition(e.target.value)}>
              {POSITIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="tpd-actions">
            <button type="button" className="tpd-btn primary" disabled={!preview} onClick={() => onLogo({ src: preview, position })}>Apply logo</button>
            {logo && <button type="button" className="tpd-btn danger" onClick={() => onLogo(null)}>Remove logo</button>}
            <button type="button" className="tpd-btn" disabled={!preview && !logo} onClick={clearLogo}>Reset logo</button>
          </div>
        </section>
      </div>

      <div className="tpd-downloads">
        <p>Your plate design is included when you save your plan.</p>
        <div className="tpd-actions">
          <button type="button" className="tpd-btn" disabled={busy} onClick={image}>Download image</button>
          <button type="button" className="tpd-btn primary" disabled={busy} onClick={pdf}>Download PDF</button>
        </div>
        {(pdfFailed || imageFailed) && <p className="tpd-notice" role="alert">{pdfFailed ? PDF_FAILED : "We couldn't prepare the image. Try again."}</p>}
      </div>
    </div>
  );
}
