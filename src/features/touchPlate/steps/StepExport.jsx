import { downloadPlatePdf } from '../../../lib/exportPlatePdf.js';
import { useDownload, PDF_FAILED } from '../../../lib/useDownload.js';

export default function StepExport({ config }) {
  const [download, pdfFailed] = useDownload(downloadPlatePdf);
  const specs = [
    ['Model', config.model || '—'],
    ['Material', config.material || '—'],
    ['Profile', config.size || '—'],
    ['Accessories', config.accessories.length ? config.accessories.map((a) => a.name).join(', ') : '—'],
    ['Panel finish', config.panel || '—'],
    ['Frame style', config.frame || '—'],
  ];

  return (
    <div>
      <div className="tpd-section-label">Your configuration</div>
      <div className="tpd-summary-card">
        {specs.map(([label, value]) => (
          <div key={label} className="tpd-summary-row">
            <span className="tpd-summary-label">{label}</span>
            <span className="tpd-summary-value">{value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="tpd-nav-btn primary" onClick={() => download(config)}>
          Download PDF
        </button>
      </div>
      {pdfFailed && <div className="field-error" role="alert" style={{ textAlign: 'right' }}>{PDF_FAILED}</div>}
    </div>
  );
}
