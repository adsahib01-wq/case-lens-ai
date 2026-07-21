"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../info.module.css";

export default function Safety() {
  const router = useRouter();

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.utilityRow}>
          <button onClick={() => router.back()} className={styles.backLink}>
            <span aria-hidden="true">←</span> Back
          </button>
          <Link href="/" className={styles.backLink}>Home</Link>
        </div>

        <header className={styles.pageHeader}>
          <h1>Safety Guidelines</h1>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            CaseLens AI is an educational medical learning application designed to support case-based reasoning, MCQ practice, confidence reflection, and revision.
          </p>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            It is not a medical device, diagnostic system, treatment platform, prescribing tool, emergency service, or replacement for qualified clinical supervision.
          </p>
        </header>
        
        <div className={styles.contentCard}>

          <div className={styles.section}>
            <h2>Educational Use Only</h2>
            <p>CaseLens AI may be used for:</p>
            <ul>
              <li>Studying fictional or de-identified clinical cases</li>
              <li>Practising medical MCQs</li>
              <li>Reviewing clinical reasoning</li>
              <li>Identifying possible learning gaps</li>
              <li>Generating educational explanations</li>
              <li>Preparing for examinations</li>
              <li>Supporting structured revision</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              <strong>CaseLens AI must not be used to make decisions about the diagnosis, treatment, medication, investigation, or emergency management of a real patient.</strong>
            </p>
          </div>

          <div className={styles.section}>
            <h2>Not for Patient Care</h2>
            <div className={styles.warningBox}>
              <p style={{ color: 'inherit', marginBottom: '12px' }}>Do not use CaseLens AI to:</p>
              <ul style={{ color: 'inherit', margin: 0 }}>
                <li>Diagnose a real patient</li>
                <li>Decide whether a patient requires emergency care</li>
                <li>Select investigations for a real patient</li>
                <li>Prescribe or recommend medication</li>
                <li>Calculate medication doses</li>
                <li>Change an existing treatment plan</li>
                <li>Delay professional medical assessment</li>
                <li>Replace examination by a qualified clinician</li>
                <li>Interpret real medical images for clinical use</li>
                <li>Provide medical clearance or certification</li>
              </ul>
              <p style={{ color: 'inherit', marginTop: '16px', marginBottom: 0 }}>
                Any medical decision involving a real person must be made by an appropriately qualified healthcare professional using current clinical information and approved medical guidance.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Medical Emergencies</h2>
            <div className={styles.warningBox}>
              <p style={{ color: 'inherit', marginBottom: '12px' }}><strong>CaseLens AI does not provide emergency medical assistance.</strong></p>
              <p style={{ color: 'inherit', marginBottom: '12px' }}>
                If a person may be experiencing a medical emergency, contact the appropriate local emergency service or seek immediate care from a qualified healthcare provider.
              </p>
              <p style={{ color: 'inherit', marginBottom: 0 }}>
                Do not wait for, rely on, or attempt to verify emergency advice through CaseLens AI.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Protect Patient Privacy</h2>
            <div className={styles.warningBox}>
              <p style={{ color: 'inherit', marginBottom: '12px' }}>Only submit fictional or properly de-identified educational case information.</p>
              <p style={{ color: 'inherit', marginBottom: '8px' }}>Do not enter:</p>
              <ul style={{ color: 'inherit', margin: 0, marginBottom: '16px' }}>
                <li>Patient names</li>
                <li>National identity numbers</li>
                <li>Passport numbers</li>
                <li>Phone numbers</li>
                <li>Email addresses</li>
                <li>Home addresses</li>
                <li>Hospital registration numbers</li>
                <li>Medical record numbers</li>
                <li>Full dates of birth</li>
                <li>Identifiable photographs</li>
                <li>Unredacted clinical documents</li>
                <li>Information that could reasonably identify a patient</li>
              </ul>
              <p style={{ color: 'inherit', marginBottom: 0 }}>
                Removing a name alone may not be sufficient. A rare diagnosis, exact date, location, occupation, or unique event may still identify a person when combined with other information.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Limitations of Artificial Intelligence</h2>
            <p>AI-generated medical content may be:</p>
            <ul>
              <li>Incorrect</li>
              <li>Incomplete</li>
              <li>Outdated</li>
              <li>Overconfident</li>
              <li>Internally inconsistent</li>
              <li>Based on misunderstood case details</li>
              <li>Missing important alternatives</li>
              <li>Poorly matched to a particular examination standard</li>
              <li>Unsupported by sufficient evidence</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              <strong>A fluent explanation is not proof that the explanation is accurate.</strong>
            </p>
            <p style={{ marginTop: '16px' }}>
              Users must verify important medical information using current, trusted sources such as:
            </p>
            <ul>
              <li>Approved medical textbooks</li>
              <li>Current clinical guidelines</li>
              <li>Official examination resources</li>
              <li>Peer-reviewed literature</li>
              <li>Qualified medical educators</li>
              <li>Clinical supervisors</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Source Verification</h2>
            <p>When a source or citation is displayed:</p>
            <ul>
              <li>Confirm that the source exists</li>
              <li>Check the edition and publication date</li>
              <li>Review the cited page or section</li>
              <li>Confirm that the source supports the specific claim</li>
              <li>Prefer current guidelines when recommendations may have changed</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              A citation does not automatically make an AI-generated conclusion correct.
            </p>
            <p>
              When no verified source is available, the content should be treated as AI-generated educational material rather than established medical guidance.
            </p>
          </div>

          <div className={styles.section}>
            <h2>Scores and Learning Analytics</h2>
            <p>Scores, confidence classifications, weak-concept labels, and adaptive recommendations are educational indicators only.</p>
            <p>They do not measure:</p>
            <ul>
              <li>Clinical competence</li>
              <li>Fitness to practise</li>
              <li>Professional eligibility</li>
              <li>Examination readiness with certainty</li>
              <li>Intelligence</li>
              <li>Diagnostic ability in real patient care</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              A classification such as "possible weakness" or "overconfident error pattern" reflects only the available practice data. Small numbers of questions may be insufficient for reliable interpretation.
            </p>
          </div>

          <div className={styles.section}>
            <h2>Confidence Ratings</h2>
            <p>Confidence ratings are used to support self-reflection.</p>
            <p>
              A high-confidence incorrect answer may indicate a possible misconception, but one response is not enough to establish a stable weakness.
            </p>
            <p>
              A low-confidence correct answer may suggest uncertainty, but it does not automatically mean the learner lacks understanding.
            </p>
            <p>
              Confidence ratings do not affect the raw MCQ score.
            </p>
          </div>

          <div className={styles.section}>
            <h2>Adaptive Difficulty</h2>
            <p>Adaptive difficulty recommendations are calculated from recorded practice performance. They are intended to suggest an appropriate level for future educational questions.</p>
            <p>Adaptive recommendations:</p>
            <ul>
              <li>Do not define the learner’s permanent ability</li>
              <li>Do not replace teacher or supervisor judgment</li>
              <li>May be limited by incomplete or incorrect question metadata</li>
              <li>Should not be interpreted as formal assessment results</li>
              <li>May require more practice evidence before becoming meaningful</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Learning Mode and Exam Mode</h2>
            <p>Learning Mode provides feedback after each submitted question.</p>
            <p>Exam Mode delays explanations until the full test is completed.</p>
            <p>Exam Mode is intended for self-directed practice only. It is not:</p>
            <ul>
              <li>Secure</li>
              <li>Proctored</li>
              <li>Tamper-proof</li>
              <li>Suitable for formal certification</li>
              <li>A replacement for an official examination platform</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              Timer results may be affected by device settings, browser behaviour, refreshes, or local-storage limitations.
            </p>
          </div>

          <div className={styles.section}>
            <h2>Medical Images and Documents</h2>
            <p>Unless a feature is specifically described as supporting medical-image education, do not use CaseLens AI to interpret:</p>
            <ul>
              <li>X-rays</li>
              <li>CT scans</li>
              <li>MRI scans</li>
              <li>Ultrasound images</li>
              <li>Histology slides</li>
              <li>ECG images</li>
              <li>Photographs of patients</li>
              <li>Laboratory reports</li>
              <li>Prescriptions</li>
              <li>Clinical documents</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              Any future image-based educational feature must not be used for real-patient diagnosis or treatment decisions.
            </p>
          </div>

          <div className={styles.section}>
            <h2>Medication and Dosage Information</h2>
            <div className={styles.warningBox}>
              <p style={{ color: 'inherit', marginBottom: '8px' }}>CaseLens AI must not be used to:</p>
              <ul style={{ color: 'inherit', margin: 0, marginBottom: '16px' }}>
                <li>Select medication for a real patient</li>
                <li>Recommend a dose</li>
                <li>Calculate paediatric or weight-based dosing</li>
                <li>Check drug suitability for an individual</li>
                <li>Determine contraindications for a real patient</li>
                <li>Replace a pharmacist, prescribing clinician, or approved drug reference</li>
              </ul>
              <p style={{ color: 'inherit', marginBottom: 0 }}>
                Medication information generated for educational questions must be independently verified.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Students and Healthcare Trainees</h2>
            <p>Students and trainees should use CaseLens AI as a supplementary learning tool. Clinical decisions must remain under the supervision of qualified professionals.</p>
            <p>CaseLens AI should not be cited as the sole authority in:</p>
            <ul>
              <li>Patient notes</li>
              <li>Clinical handovers</li>
              <li>Assignments requiring primary sources</li>
              <li>Research publications</li>
              <li>Professional examinations</li>
              <li>Institutional clinical decisions</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Reporting Incorrect or Unsafe Content</h2>
            <p>Stop using a generated result if it appears:</p>
            <ul>
              <li>Medically unsafe</li>
              <li>Contradictory</li>
              <li>Unsupported</li>
              <li>Based on invented findings</li>
              <li>Inconsistent with the case</li>
              <li>Inappropriate for the selected difficulty</li>
              <li>Missing important safety information</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              <strong>Do not follow the output for patient care.</strong>
            </p>
            <p style={{ marginTop: '16px' }}>Record, where possible:</p>
            <ul>
              <li>The case or question involved</li>
              <li>The incorrect statement</li>
              <li>The expected correction</li>
              <li>The date and application version</li>
              <li>Whether the issue appeared in analysis, MCQs, explanations, or reports</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Local Data Safety</h2>
            <p>The current version may store cases, questions, attempts, and results in the active browser profile.</p>
            <p>Users should understand that:</p>
            <ul>
              <li>Clearing browser data may delete saved learning history</li>
              <li>Local data may not be backed up</li>
              <li>Data may not appear on another device</li>
              <li>Other people using the same browser profile may be able to access stored records</li>
              <li>Private or identifiable patient information must not be stored</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Information Sent for AI Processing</h2>
            <p>
              When an AI generation feature is used, relevant educational case content may be transmitted through the application’s server to the configured AI provider.
            </p>
            <p>
              The application should send only the information required for the requested operation. Users must not submit confidential, identifiable, or legally restricted information.
            </p>
          </div>

          <div className={styles.section}>
            <h2>Intended Users</h2>
            <p>CaseLens AI is intended for:</p>
            <ul>
              <li>Medical students</li>
              <li>Healthcare trainees</li>
              <li>Examination candidates</li>
              <li>Educators reviewing fictional educational material</li>
              <li>Learners practising structured medical reasoning</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              It is not intended for unsupervised clinical care or public self-diagnosis.
            </p>
          </div>

          <div className={styles.section}>
            <h2>User Responsibility</h2>
            <p>By using CaseLens AI, users accept responsibility for:</p>
            <ul>
              <li>Submitting only fictional or de-identified information</li>
              <li>Verifying medical content</li>
              <li>Using trusted sources</li>
              <li>Seeking qualified clinical advice when required</li>
              <li>Not relying on the application for real-patient decisions</li>
              <li>Reporting unsafe or incorrect content</li>
              <li>Understanding that AI output may be wrong</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Final Safety Notice</h2>
            <div style={{ backgroundColor: 'var(--accent-color)', color: '#fff', padding: '24px', borderRadius: '12px', marginTop: '16px' }}>
              <p style={{ color: 'inherit', margin: 0, fontWeight: 700, fontSize: '1.2rem', marginBottom: '12px' }}>CaseLens AI supports learning. It does not provide medical care.</p>
              <p style={{ color: 'inherit', margin: 0, marginBottom: '12px', lineHeight: '1.6' }}>
                Never use its output as the sole basis for diagnosing, treating, prescribing for, or managing a real patient.
              </p>
              <p style={{ color: 'inherit', margin: 0, lineHeight: '1.6' }}>
                When medical accuracy matters, verify the information using current trusted sources and qualified professional guidance.
              </p>
            </div>
          </div>

          <div className={styles.footerActions}>
            <Link href="/how-it-works" className={`${styles.actionButton} ${styles.secondaryButton}`}>Explore How It Works</Link>
            <Link href="/privacy" className={`${styles.actionButton} ${styles.primaryButton}`}>Privacy Policy</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
