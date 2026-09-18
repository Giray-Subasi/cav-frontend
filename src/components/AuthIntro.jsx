const lifecycleStages = [
  'CREATED',
  'DOWNLOADING',
  'DOWNLOADED',
  'ENABLED',
]

export function ChipIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  )
}

export default function AuthIntro() {
  return (
    <section
      className="cav-login-intro"
      aria-labelledby="cav-intro-title"
    >
      <div className="cav-login-brand">
        <span className="cav-login-brand-mark">
          <ChipIcon />
        </span>

        <span className="cav-login-brand-name">C.A.V</span>

        <span className="cav-login-brand-divider" />

        <span className="cav-login-brand-caption">
          eSIM MANAGEMENT
        </span>
      </div>

      <div className="cav-login-intro-content">
        <span className="cav-login-eyebrow">
          YOUR PROFILE MANAGEMENT WORKSPACE
        </span>

        <h1 id="cav-intro-title">
          Your eSIM
          <br />
          operations,
          <br />
          <span>in one place.</span>
        </h1>

        <p>
          Manage eSIM profiles, track their lifecycle,
          and bring user and administrator operations
          together in one workspace.
        </p>

        <div className="cav-login-workflow">
          <div className="cav-login-workflow-heading">
            <span
              className="cav-login-workflow-icon"
              aria-hidden="true"
            >
              <ChipIcon />
            </span>

            <div>
              <span className="cav-login-workflow-label">
                PROFILE LIFECYCLE
              </span>

              <strong>From creation to activation</strong>
            </div>
          </div>

          <div className="cav-login-stage-list">
            {lifecycleStages.map((stage, index) => (
              <div className="cav-login-stage" key={stage}>
                <span className="cav-login-stage-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span>{stage}</span>

                {index < lifecycleStages.length - 1 && (
                  <span
                    className="cav-login-stage-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="cav-login-workflow-note">
            Illustration of the supported profile workflow.
          </p>
        </div>
      </div>

      <div className="cav-login-intro-footer">
        <span>ROLE-BASED ACCESS</span>
        <span className="cav-login-footer-dot" />
        <span>REST API</span>
        <span className="cav-login-footer-dot" />
        <span>PROFILE LIFECYCLE</span>
      </div>
    </section>
  )
}