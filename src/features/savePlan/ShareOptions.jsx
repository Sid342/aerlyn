import { useRef, useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { downloadPdf } from '../../lib/exportPdf.js';
import { planLink, whatsappShareUrl } from '../../lib/planShare.js';
import { useDownload, PDF_FAILED } from '../../lib/useDownload.js';
import './ShareOptions.css';

// The plan link with copy, WhatsApp and PDF. No form: nothing here is sent to Aerlyn.
export default function ShareOptions() {
  const { plan } = useHome();
  const [copied, setCopied] = useState(null); // null | 'copied' | 'selected'
  const linkInput = useRef(null);
  const [download, pdfFailed] = useDownload(downloadPdf);
  const link = planLink(window.location.origin, plan);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied('copied');
    } catch {
      // no clipboard access: select the link so it can be copied by hand
      linkInput.current.select();
      setCopied('selected');
    }
  }

  return (
    <div className="share">
      <label className="share-label" htmlFor="share-plan-link">Your plan link. It opens this plan on any phone or computer.</label>
      <input id="share-plan-link" ref={linkInput} className="lead-input share-link" readOnly value={link} onFocus={(e) => e.target.select()} />
      <div className="share-actions">
        <button type="button" className="btn quiet" onClick={copyLink}>{copied === 'copied' ? 'Copied' : 'Copy link'}</button>
        <a className="btn quiet" href={whatsappShareUrl(link)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <button type="button" className="btn quiet" onClick={() => download(plan)}>Download PDF</button>
      </div>
      <div className="share-hint" role="status">
        {copied === 'selected' && 'The link is selected. Copy it with Ctrl+C or ⌘C, or press and hold on a phone.'}
      </div>
      {pdfFailed && <div className="field-error" role="alert">{PDF_FAILED}</div>}
    </div>
  );
}
