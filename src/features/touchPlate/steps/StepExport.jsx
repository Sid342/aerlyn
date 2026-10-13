import { downloadPlatePdf } from '../../../lib/exportPlatePdf.js';
import { plateDetails } from '../../../lib/plateLayout.js';
import { useDownload, PDF_FAILED } from '../../../lib/useDownload.js';

export default function StepExport({ config, roomName }) {
  const [download, pdfFailed] = useDownload(downloadPlatePdf);
  const accessories = plateDetails(config);
  const specs = [
    ...(roomName ? [['Room', roomName]] : []),
    ['Plate size', config.model || '—'],
    ['Colour', config.material || '—'],
    ['Profile', config.size || '—'],
    ['Finish', config.panel || '—'],
    ['Frame', config.frame || '—'],
  ];

  return (
    <div>
      <div className="tpd-section-label">Your plate</div>
      <div className="tpd-summary-card">
        {specs.map(([label, value]) => (
          <div key={label} className="tpd-summary-row">
            <span className="tpd-summary-label">{label}</span>
            <span className="tpd-summary-value">{value}</span>
          </div>
        ))}
        {accessories.length === 0 && (
          <div className="tpd-summary-row">
            <span className="tpd-summary-label">Accessories</span>
            <span className="tpd-summary-value">—</span>
          </div>
        )}
        {accessories.map((a) => (
          <div key={a.modules} className="tpd-summary-row">
            <span className="tpd-summary-label">{a.modules}</span>
            <span className="tpd-summary-value">
              {a.name}
              {a.icons.length > 0 && <span className="tpd-summary-icons">{a.icons.join(', ')}</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="tpd-download">
        <button type="button" className="tpd-nav-btn primary" onClick={() => download(config, roomName)}>
          Download PDF
        </button>
      </div>
      {pdfFailed && <div className="field-error" role="alert" style={{ textAlign: 'right' }}>{PDF_FAILED}</div>}
    </div>
  );
}
