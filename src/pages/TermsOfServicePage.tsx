import InfoPageLayout from '../components/InfoPageLayout';

export default function TermsOfServicePage() {
  return (
    <InfoPageLayout
      icon="📜"
      title="Terms of Service"
      lastUpdated="2026"
    >
      <h2>Using This Site</h2>
      <p>
        Algostructures is a free, educational resource. By using the site, you agree to use it for
        personal learning and reference — nothing here requires an account, a fee, or an
        agreement beyond simply browsing responsibly.
      </p>

      <h2>No Warranty</h2>
      <p>
        Content, diagrams, and code examples are provided "as is," for educational purposes. While
        every effort is made to keep explanations accurate and code compilable, Algostructures
        makes no guarantee that any example is free of errors or suitable for production use.
        Always verify critical logic independently, especially for anything beyond learning.
      </p>

      <h2>Availability</h2>
      <p>
        This is a solo, actively-maintained project. The site may occasionally be updated,
        restructured, or briefly unavailable during changes — there is no uptime guarantee, though
        keeping the site accessible is always the goal.
      </p>

      <h2>Your Local Data</h2>
      <p>
        Progress and scores are stored only in your browser and are your responsibility to back up if
        that matters to you — see the <strong>Privacy Policy</strong> page for exactly what's stored.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        These terms may be updated as the site evolves. Continued use of the site after a change
        means you accept the updated terms.
      </p>
    </InfoPageLayout>
  );
}
