"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../info.module.css";

export default function AboutCaseLensAI() {
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
          <h1>About CaseLens AI</h1>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            CaseLens AI is an AI-assisted medical learning application designed to help learners practise clinical reasoning through structured case analysis, case-based MCQs, confidence reflection, and detailed answer review.
          </p>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            The platform is intended for medical students, healthcare trainees, examination candidates, and educators working with fictional or properly de-identified educational cases.
          </p>
          <p style={{ marginTop: '16px', color: 'var(--accent-color)', fontSize: '1.1rem', fontWeight: 600 }}>
            CaseLens AI supports learning. It does not provide medical care.
          </p>
        </header>
        
        <div className={styles.contentCard}>

          <div className={styles.section}>
            <h2>What CaseLens AI Helps You Do</h2>
            <p>CaseLens AI helps learners:</p>
            <ul>
              <li>Analyse clinical case information</li>
              <li>Identify important positive and negative findings</li>
              <li>Build and compare differential diagnoses</li>
              <li>Practise case-specific medical MCQs</li>
              <li>Understand why an answer is correct</li>
              <li>Understand why alternative options are incorrect</li>
              <li>Reflect on confidence before submitting answers</li>
              <li>Identify repeated errors and weaker concepts</li>
              <li>Review performance across multiple tests</li>
              <li>Generate focused educational study guidance</li>
            </ul>
            <p style={{ marginTop: '16px', fontWeight: 600 }}>The goal is not simply to display scores.</p>
            <p style={{ marginTop: '16px' }}>The goal is to help learners understand:</p>
            <ul>
              <li>Which clue matters most</li>
              <li>Where their reasoning changed</li>
              <li>Which misconception affected the answer</li>
              <li>Which concepts require further review</li>
              <li>What should be practised next</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>How the Learning Workflow Works</h2>
            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.1)', marginTop: '16px' }}>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>1.</span> Enter a fictional or de-identified clinical case</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>2.</span> Generate a structured educational analysis</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>3.</span> Review key findings and reasoning</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>4.</span> Generate case-specific MCQs</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>5.</span> Complete questions in Learning Mode or Exam Mode</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>6.</span> Review detailed question-by-question explanations</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>7.</span> Identify confidence patterns and concept weaknesses</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent-color)' }}>8.</span> Continue with focused or adaptive practice</li>
              </ul>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Learning Mode</h2>
            <p>Learning Mode is designed for guided study.</p>
            <p>After each question is submitted, the learner can review:</p>
            <ul>
              <li>Whether the answer was correct</li>
              <li>The correct answer</li>
              <li>Why the correct answer is correct</li>
              <li>Why the selected answer is incorrect</li>
              <li>Why every alternative option is incorrect</li>
              <li>The decisive clue</li>
              <li>The reasoning framework</li>
              <li>Confidence interpretation</li>
              <li>Error classification</li>
              <li>Tested medical concepts</li>
              <li>High-yield takeaway</li>
            </ul>
            <p style={{ marginTop: '16px' }}>At the end of the test, the same stored question analyses are collected into one complete review.</p>
          </div>

          <div className={styles.section}>
            <h2>Exam Mode</h2>
            <p>Exam Mode is designed for self-directed assessment practice.</p>
            <p>During the test:</p>
            <ul>
              <li>Correctness remains hidden</li>
              <li>Explanations remain hidden</li>
              <li>Submitted answers remain locked</li>
              <li>Hints are unavailable</li>
              <li>Only a neutral answer-recorded message is shown</li>
            </ul>
            <p style={{ marginTop: '16px' }}>After the complete test is submitted, the full score, confidence analysis, concept performance, and question-by-question explanations are revealed.</p>
            <p style={{ marginTop: '16px' }}><strong>Exam Mode is not secure, proctored, or suitable for formal certification.</strong></p>
          </div>

          <div className={styles.section}>
            <h2>Structured Question Review</h2>
            <p>CaseLens AI is designed to go beyond basic correct-or-incorrect feedback.</p>
            <p>Each question review may include:</p>
            <ul>
              <li>Original question and answer options</li>
              <li>Learner response</li>
              <li>Correct answer</li>
              <li>Confidence rating</li>
              <li>Correct-answer explanation</li>
              <li>Selected-answer analysis</li>
              <li>Explanation of every option</li>
              <li>Decisive clue</li>
              <li>Clinical reasoning steps</li>
              <li>Probable error type</li>
              <li>Concept classification</li>
              <li>Difficulty analysis</li>
              <li>High-yield takeaway</li>
              <li>Focused review actions</li>
            </ul>
            <p style={{ marginTop: '16px' }}>A question review is constructed once and reused consistently.</p>
            <p>The final Results page does not generate a different explanation from the one shown during Learning Mode.</p>
          </div>

          <div className={styles.section}>
            <h2>Confidence Reflection</h2>
            <p>Before submitting an answer, learners may record confidence as:</p>
            <ul>
              <li>Low</li>
              <li>Moderate</li>
              <li>High</li>
            </ul>
            <p style={{ marginTop: '16px' }}>Confidence does not change the raw score.</p>
            <p>It is used to help distinguish between:</p>
            <ul>
              <li>Reliable understanding</li>
              <li>Correct answers with uncertainty</li>
              <li>Possible misconceptions</li>
              <li>High-confidence errors</li>
              <li>Concepts requiring reinforcement</li>
            </ul>
            <p style={{ marginTop: '16px' }}>Confidence patterns are educational indicators only. They do not measure intelligence, clinical competence, or professional ability.</p>
          </div>

          <div className={styles.section}>
            <h2>Performance Across Tests</h2>
            <p>The Overall Results page combines eligible results from completed tests.</p>
            <p>It may show:</p>
            <ul>
              <li>Cases attempted</li>
              <li>Tests completed</li>
              <li>Total questions solved</li>
              <li>Correct answers</li>
              <li>Incorrect answers</li>
              <li>Unanswered questions</li>
              <li>Overall score</li>
              <li>Confidence calibration</li>
              <li>Master weak-concept list</li>
              <li>Error count by concept</li>
              <li>Total questions solved by concept</li>
              <li>Accuracy by concept</li>
              <li>High-confidence errors</li>
              <li>Adaptive review recommendations</li>
            </ul>
            <p style={{ marginTop: '16px' }}>The purpose is to provide one clear view of learning patterns across previous practice sessions.</p>
          </div>

          <div className={styles.section}>
            <h2>Adaptive Practice</h2>
            <p>Adaptive Difficulty is designed to recommend future question difficulty using deterministic application rules.</p>
            <p>The system may consider:</p>
            <ul>
              <li>Correctness</li>
              <li>Confidence</li>
              <li>Repeated errors</li>
              <li>Hint use</li>
              <li>Previous difficulty</li>
              <li>Recent attempts within the same concept</li>
            </ul>
            <p style={{ marginTop: '16px' }}>The AI does not independently decide the learner’s level.</p>
            <p style={{ marginTop: '16px' }}>Adaptive recommendations:</p>
            <ul>
              <li>Apply only to future practice</li>
              <li>Move one difficulty level at a time</li>
              <li>Do not change an active Exam Mode session</li>
              <li>Do not define permanent learner ability</li>
              <li>Require sufficient evidence before meaningful interpretation</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>How Artificial Intelligence Is Used</h2>
            <p>CaseLens AI uses artificial intelligence to generate structured educational content.</p>
            <p>AI may be used for:</p>
            <ul>
              <li>Educational case analysis</li>
              <li>MCQ generation</li>
              <li>Correct-answer explanations</li>
              <li>Distractor explanations</li>
              <li>Reasoning frameworks</li>
              <li>Differential comparison</li>
              <li>Progressive case stages</li>
              <li>Focused study material</li>
              <li>Adaptive-review questions</li>
            </ul>
            <p style={{ marginTop: '16px' }}>AI is not used as the authoritative calculator for:</p>
            <ul>
              <li>Scores</li>
              <li>Correct and incorrect totals</li>
              <li>Timer calculations</li>
              <li>Confidence counts</li>
              <li>Attempt uniqueness</li>
              <li>Session status</li>
              <li>Adaptive decision rules</li>
              <li>Local data ownership</li>
            </ul>
            <p style={{ marginTop: '16px' }}>These functions are handled through deterministic application logic.</p>
          </div>

          <div className={styles.section}>
            <h2>AI Validation</h2>
            <p>AI output is not accepted automatically.</p>
            <p>Generated content should pass through:</p>
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)', marginTop: '16px', marginBottom: '16px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>AI response → JSON parsing → Schema validation → Semantic validation → Controlled retry when appropriate → Accepted educational content or recoverable error</p>
            </div>
            <p>CaseLens AI may still generate incorrect, incomplete, outdated, or misleading information.</p>
            <p><strong>Important medical information must be verified against current trusted resources.</strong></p>
          </div>

          <div className={styles.section}>
            <h2>Data and Privacy</h2>
            <p>The current prototype stores learning records in the user’s browser.</p>
            <p>This may include:</p>
            <ul>
              <li>Cases</li>
              <li>Generated analyses</li>
              <li>Questions</li>
              <li>Answers</li>
              <li>Scores</li>
              <li>Confidence records</li>
              <li>Practice sessions</li>
              <li>Results</li>
              <li>Learning summaries</li>
            </ul>
            <p style={{ marginTop: '16px' }}>When an AI feature is requested, the relevant educational content may be sent through the application’s backend to the configured AI provider.</p>
            <div className={styles.warningBox}>
              <p style={{ color: 'inherit', marginBottom: '8px' }}>Users must not submit:</p>
              <ul style={{ color: 'inherit', margin: 0 }}>
                <li>Identifiable patient information</li>
                <li>Confidential clinical records</li>
                <li>Medical record numbers</li>
                <li>Patient photographs</li>
                <li>Unredacted documents</li>
                <li>Passwords or API keys</li>
                <li>Restricted institutional information</li>
              </ul>
            </div>
            <p style={{ marginTop: '16px' }}>More information is available on the <Link href="/privacy" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link> page.</p>
          </div>

          <div className={styles.section}>
            <h2>Educational Safety</h2>
            <p>CaseLens AI is intended for educational use only.</p>
            <div className={styles.warningBox}>
              <p style={{ color: 'inherit', marginBottom: '8px' }}>It must not be used to:</p>
              <ul style={{ color: 'inherit', margin: 0 }}>
                <li>Diagnose a real patient</li>
                <li>Select treatment</li>
                <li>Recommend medication</li>
                <li>Calculate doses</li>
                <li>Decide emergency management</li>
                <li>Replace a clinician</li>
                <li>Interpret medical images for patient care</li>
                <li>Delay professional medical assessment</li>
              </ul>
            </div>
            <p style={{ marginTop: '16px' }}>More information is available on the <Link href="/safety" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>Safety Guidelines</Link> page.</p>
          </div>

          <div className={styles.section}>
            <h2>Current Project Status</h2>
            <p>CaseLens AI is an evolving educational prototype.</p>
            <p>Current and developing capabilities include:</p>
            <ul>
              <li>Clinical case submission</li>
              <li>AI-assisted case analysis</li>
              <li>Case-based MCQs</li>
              <li>Question-by-question review</li>
              <li>Learning Mode</li>
              <li>Exam Mode</li>
              <li>Confidence reflection</li>
              <li>Weak-concept aggregation</li>
              <li>Adaptive practice</li>
              <li>Printable educational reports</li>
            </ul>
            <p style={{ marginTop: '16px' }}>Future development may include:</p>
            <ul>
              <li>IndexedDB-based local storage</li>
              <li>Cloud synchronization</li>
              <li>Account-based learning history</li>
              <li>Source-grounded medical content</li>
              <li>Licensed textbook resources</li>
              <li>Medical figures and page references</li>
              <li>Verified citations</li>
              <li>Structured revision queues</li>
            </ul>
            <p style={{ marginTop: '16px' }}>Future capabilities should not be treated as currently available until implemented and verified.</p>
          </div>

          <div className={styles.section}>
            <h2>Technology</h2>
            <p>CaseLens AI is built using:</p>
            <ul>
              <li>Next.js</li>
              <li>React</li>
              <li>TypeScript</li>
              <li>Next.js App Router</li>
              <li>Zustand</li>
              <li>Zod</li>
              <li>Groq</li>
              <li>Vercel</li>
            </ul>
            <p style={{ marginTop: '16px' }}>The browser interface communicates with server-side Next.js routes.</p>
            <p>AI credentials remain on the server and are not intentionally exposed to the browser.</p>
          </div>

          <div className={styles.section}>
            <h2>Project Context</h2>
            <p>CaseLens AI was developed as an AI-enabled educational application for the ACT AI Final Course Project.</p>
            <p style={{ marginTop: '16px' }}><strong>Author:</strong> Shahzaib</p>
          </div>

          <div className={styles.section}>
            <h2>Important Notice</h2>
            <div style={{ backgroundColor: 'var(--accent-color)', color: '#fff', padding: '24px', borderRadius: '12px', marginTop: '16px' }}>
              <p style={{ color: 'inherit', margin: 0, fontWeight: 700, fontSize: '1.2rem', marginBottom: '12px' }}>CaseLens AI is a learning tool.</p>
              <p style={{ color: 'inherit', margin: 0, marginBottom: '12px', lineHeight: '1.6' }}>
                It is not a medical device, diagnostic platform, treatment system, prescribing service, emergency service, or replacement for trusted medical resources and qualified professional supervision.
              </p>
              <p style={{ color: 'inherit', margin: 0, lineHeight: '1.6' }}>
                Always verify important medical information using current textbooks, guidelines, official examination resources, and qualified educators.
              </p>
            </div>
          </div>

          <div className={styles.footerActions}>
            <Link href="/privacy" className={`${styles.actionButton} ${styles.secondaryButton}`}>Read Privacy Policy</Link>
            <Link href="/safety" className={`${styles.actionButton} ${styles.primaryButton}`}>Review Safety Guidelines</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
