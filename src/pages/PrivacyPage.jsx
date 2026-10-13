import { site } from '../config/site.js';
import Shell from './Shell.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import './pages.css';

export default function PrivacyPage() {
  return (
    <Shell>
      <div className="page-wrap">
        <Breadcrumb current="Privacy Policy" />
        <h1>Privacy Policy</h1>
        <p className="page-muted">Effective date: 6 June 2026 · Last updated: 13 October 2026</p>

        <h2>1. Introduction</h2>
        <p>{site.legalName} ("we", "us", or "our") operates the {site.brand} smart-home app, which lets you control and automate compatible BLE and Wi-Fi smart switches in your home. This Privacy Policy explains what information we collect and how we use it. It covers the {site.brand} mobile app as well as these supporting web pages. By using the app, you agree to the practices described here.</p>

        <h2>2. Information we collect</h2>
        <p>We collect only what we need to make {site.brand} work for you:</p>
        <ul>
          <li>Account information you provide, such as your name and email address.</li>
          <li>Home and room configuration you create, including room names, layouts, and the smart switches you add.</li>
          <li>Device-control commands you issue, such as turning switches on or off and running scenes or schedules.</li>
          <li>BLE and Wi-Fi device connectivity data needed to discover, pair, and communicate with your switches.</li>
          <li>App usage and diagnostics, such as feature usage and crash or error logs, to help us keep the app stable.</li>
        </ul>

        <h2>3. How we use your information</h2>
        <p>We use the information we collect to operate device control and automation, sync your home configuration across your sessions and devices, improve and develop app features, provide customer support, and maintain the security and integrity of the service.</p>

        <h2>4. Sharing &amp; third parties</h2>
        <p>We do not sell your data. We share information only with cloud hosting providers that store and process data on our behalf, and with voice assistant platforms such as Amazon Alexa and Google Home — but only when you choose to link those accounts, and only to the extent needed to enable voice control of your devices.</p>

        <h2>5. Data retention</h2>
        <p>We keep your information for as long as your account remains active. If you ask us to delete your account or data, we will delete it from our active systems within a reasonable period, except where we are required to retain it by law.</p>

        <h2>6. Security</h2>
        <p>We protect your data using encryption in transit and access controls that limit who can reach it. While we work hard to safeguard your information, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h2>7. Your rights</h2>
        <p>You have the right to access, correct, and delete the personal information we hold about you. To exercise any of these rights, contact us by email at the address below and we will respond as required by applicable law.</p>

        <h2>8. Children's privacy</h2>
        <p>{site.brand} is not directed at children under the age of 13, and we do not knowingly collect personal information from anyone under 13. If you believe a child has provided us with personal information, please contact us so we can remove it.</p>

        <h2>9. Changes to this policy</h2>
        <p>We may update this Privacy Policy from time to time. When we do, we will post the revised policy on this page and update the effective date above. Your continued use of the app after changes take effect constitutes acceptance of the updated policy.</p>

        <h2>10. Contact us</h2>
        <p>If you have questions about this Privacy Policy or your data, please contact us:</p>
        <p>
          {site.legalName}<br />{site.address}
          {site.email && <><br /><a href={`mailto:${site.email}`}>{site.email}</a></>}
        </p>

        <h2>11. This website</h2>
        <p>This section covers what happens when you use this website ({site.origin.replace('https://', '')}) rather than the app.</p>
        <p>We collect only what you type into a form and send to us:</p>
        <ul>
          <li>Book a visit: your name and phone number, and — if you fill them in — your city or area, property type, timeline and notes.</li>
          <li>Save my plan: your name, phone number, city (optional) and the plan itself — the home type, rooms, devices, switch plan, custom scenes and plate design you built.</li>
        </ul>
        <p>We use these details to contact you about your visit or quote. Form submissions are delivered to our email by Formspree, a third-party form processor that handles the data on our behalf.</p>
        <p>The plan you build is stored in your own browser's storage, on your device, so it is still there when you come back. A floor plan image you upload stays in the page only — it is not stored and not sent to us. A plan link contains the plan data itself; it does not contain your name or phone number. Anyone you give the link to can open that plan.</p>
        <p>We use Vercel Web Analytics, which collects anonymous usage events — such as a plan being started or saved — with no personal data. The fonts on this website are loaded from Google Fonts.</p>
        <p>To ask us to delete details you sent through this website, {site.email ? <>email <a href={`mailto:${site.email}`}>{site.email}</a></> : 'contact us at the address above'}. You can remove the plan kept in your browser at any time by clearing this site's data in your browser settings.</p>
      </div>
    </Shell>
  );
}
