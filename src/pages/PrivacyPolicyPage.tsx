import InfoPageLayout from '../components/InfoPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      icon="🔒"
      title="Privacy Policy"
      lastUpdated="2026"
    >
      <h2>The Short Version</h2>
      <p>
        Algostructures does not collect, store, or transmit any personal data. There is no
        analytics script, no tracking pixel, and no server-side account system on this site. The
        only things saved anywhere are a few small preferences in your own browser (like which practice questions you finished and your best Tower of Hanoi score), and they never leave your browser.
      </p>

      <h2>What's Stored, and Where</h2>
      <ul>
        <li><strong>Progress and scores</strong> — which Practice Questions you've completed and your best Tower of Hanoi score per disk count are saved in your browser's <code>localStorage</code>. They are never sent to any server.</li>
        <li><strong>Nothing else</strong> — no cookies, no session identifiers, no third-party scripts of any kind are loaded by this site.</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>
        This page loads fonts from Google Fonts (Orbitron, JetBrains Mono, Rajdhani) via a CDN
        link — this is the only external network request the site makes on page load. No other
        third-party service, analytics provider, or advertising network is used.
      </p>

      <h2>Clearing Your Data</h2>
      <p>
        Since everything is stored locally, clearing your browser's site data for Algostructures
        (or using a private/incognito window) removes that progress completely — there is no
        account to delete because there is no account.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        If this ever changes — for example, if analytics or an account system is added in the
        future — this page will be updated to reflect it, and the "Last updated" date above will
        change accordingly.
      </p>
    </InfoPageLayout>
  );
}
