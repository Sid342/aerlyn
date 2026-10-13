import { site } from '../config/site.js';
import { policyDoc } from '../data/policies.js';
import { POLICY_PATHS, PRIVACY_PATH } from '../routes.js';
import Shell from './Shell.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import './pages.css';

const OTHERS = [
  ['terms', 'Terms and Conditions'],
  ['refund', 'Refund and Return Policy'],
  ['shipping', 'Shipping Policy'],
];

export default function PolicyPage({ route }) {
  const doc = policyDoc(route.policy);
  return (
    <Shell>
      <div className="page-wrap">
        <Breadcrumb current={doc.title} />
        <h1>{doc.title}</h1>
        <p className="page-muted">Last updated: {doc.updated}</p>

        {doc.sections.map(({ heading, paragraphs, list }) => (
          <section key={heading}>
            <h2>{heading}</h2>
            {paragraphs.map((text) => <p key={text}>{text}</p>)}
            {list && <ul>{list.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>
        ))}

        <h2>Contact us</h2>
        <p>
          {site.legalName}<br />{site.address}
          {site.gstin && <><br />GSTIN {site.gstin}</>}
          {site.email && <><br /><a href={`mailto:${site.email}`}>{site.email}</a></>}
        </p>
        <p className="page-muted">
          See also:{' '}
          {OTHERS.filter(([key]) => key !== route.policy).map(([key, label]) => (
            <span key={key}><a href={POLICY_PATHS[key]}>{label}</a> · </span>
          ))}
          <a href={PRIVACY_PATH}>Privacy Policy</a>
        </p>
      </div>
    </Shell>
  );
}
