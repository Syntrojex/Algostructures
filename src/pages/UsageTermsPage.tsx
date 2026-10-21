import InfoPageLayout from '../components/InfoPageLayout';

export default function UsageTermsPage() {
  return (
    <InfoPageLayout
      icon="⚖️"
      title="Usage Terms"
      intro="Rules specifically for reusing the content and code on this site — separate from the general Terms of Service."
      lastUpdated="2026 · v2.0.3"
    >
      <h2>Scope of These Terms</h2>
      <p>
        This page covers how you may reuse what's actually <em>on</em> Algostructures — the
        written explanations, diagrams, and C++ code. It does not cover accounts, uptime, or
        liability; that general legal ground is covered separately on the{' '}
        <strong>Terms of Service</strong> page.
      </p>

      <h2>Using the Code Examples</h2>
      <p>
        Every code example and practice problem on Algostructures is free to copy, compile, run,
        modify, and learn from — that's the entire point of the site. Use them in your own
        practice, coursework, portfolio projects, or personal tools without needing to ask
        permission first.
      </p>
      <p>
        All code is intentionally written using only <code>&lt;iostream&gt;</code> and plain,
        manually-managed arrays — no STL containers standing in for the underlying mechanics — so
        what you copy is exactly the logic being taught, nothing hidden behind a library call.
      </p>

      <h2>Using the Written Content</h2>
      <p>
        Explanations, dry runs, diagrams, and complexity tables may be read, quoted in short
        excerpts, and referenced freely for study notes, presentations, or blog posts, provided
        you're not passing them off as your own original writing when reproduced at length (see
        "What's Not Allowed" below).
      </p>

      <h2>Attribution</h2>
      <p>
        Attribution isn't required for personal or educational use, but it's appreciated whenever
        you republish substantial chunks of explanations, diagrams, or code comments elsewhere — a
        link back to Algostructures helps other learners find the full context and any updates
        made to that topic since.
      </p>

      <h2>What's Not Allowed</h2>
      <ul>
        <li>Reselling or paywalling this content, in bulk or individually, as your own paid product.</li>
        <li>Bulk-scraping the entire site to republish as a competing, unmodified copy.</li>
        <li>Removing attribution while presenting substantial verbatim content as your own original work.</li>
        <li>Using the code or content to train a competing product that redistributes it verbatim without attribution.</li>
      </ul>

      <h2>Educational Use Encouraged</h2>
      <p>
        Teachers, students, and self-learners are explicitly encouraged to use, adapt, and share
        individual topics or examples for teaching and learning purposes — in classrooms, study
        groups, or personal notes — that's exactly what this site was built for.
      </p>

      <h2>No Warranty on Content</h2>
      <p>
        Content is maintained carefully, but it's provided <strong>as-is</strong>, without warranty
        of any kind. Always verify critical logic (complexity claims, edge cases, exact algorithm
        steps) yourself before relying on it for graded work, interviews, or production code —
        and if you do spot an error, please report it via the <strong>Feedback</strong> page.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        These terms may be revised as the site evolves. The <strong>Last updated</strong> date at
        the top of this page reflects the most recent revision; continued use of the site after a
        change means you accept the updated terms.
      </p>
    </InfoPageLayout>
  );
}
