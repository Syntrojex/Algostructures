import InfoPageLayout from '../components/InfoPageLayout';

export default function FeedbackPage() {
  return (
    <InfoPageLayout
      icon="💬"
      title="Feedback"
      intro="Found a bug or a visualizer that could be clearer? Here's how to reach out."
    >
      <h2>Report a Bug or Typo</h2>
      <p>
        The fastest way to report something broken — a wrong step, a visualizer that freezes, a
        practice answer that is marked incorrectly — is to open an issue on GitHub. Include the
        visualizer name and, if possible, the input you used.
      </p>
      <a
        className="info-page-cta"
        href="https://github.com/Syntrojex/Algostructures/issues/new"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open an Issue on GitHub →
      </a>

      <h2>Suggest a Visualizer</h2>
      <p>
        Think a structure or algorithm is missing? Suggestions are welcome — reach out via
        GitHub or LinkedIn with what you'd like to see and why.
      </p>

      <h2>Clarity Feedback</h2>
      <p>
        If a step note didn't make sense, or a control was confusing, that is exactly the kind of
        feedback that improves the site fastest.
      </p>

      <h2>Direct Contact</h2>
      <p>
        For anything else, connect via{' '}
        <a href="https://www.linkedin.com/in/mustafa-amir-syntrojex" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>{' '}
        or{' '}
        <a href="https://github.com/Syntrojex/Algostructures" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>.
      </p>
    </InfoPageLayout>
  );
}
