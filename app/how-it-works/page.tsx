"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../info.module.css";

export default function HowItWorks() {
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
          <h1>How It Works</h1>
        </header>
        
        <div className={styles.contentCard}>
          <div className={styles.section}>
            <h2>The Process</h2>
            <ul>
              <li><strong>Input Clinical Data:</strong> Paste or type a clinical scenario into the new case form. You can choose single-stage or progressive formats.</li>
              <li><strong>AI Analysis:</strong> When you analyze a case, the text is sent securely to the AI model, processed, and a comprehensive educational breakdown is generated.</li>
              <li><strong>Record Reasoning:</strong> Before seeing the AI's differential, you'll be prompted to record your own leading diagnosis, alternatives, and confidence level.</li>
              <li><strong>Compare & Learn:</strong> The system automatically compares your reasoning against the AI's standard, highlighting strengths, blind spots, and areas for improvement.</li>
              <li><strong>Test Your Knowledge:</strong> Generate tailored MCQs based on the case to solidify your learning.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Local Privacy & Storage</h2>
            <ul>
              <li><strong>Local Storage:</strong> All your cases, analysis, and scores are stored locally in your browser. Nothing is saved to a central database.</li>
              <li><strong>Offline Mode:</strong> You can view your saved history offline, but new AI requests require an internet connection.</li>
            </ul>
          </div>

          <div className={styles.footerActions}>
            <Link href="/about" className={`${styles.actionButton} ${styles.secondaryButton}`}>About CaseLens AI</Link>
            <Link href="/new-case" className={`${styles.actionButton} ${styles.primaryButton}`}>Start New Case</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
