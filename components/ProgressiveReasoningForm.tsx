import React, { useState, useEffect } from "react";
import styles from "./ProgressiveCaseReveal.module.css";
import { ProgressiveStageDraft, ProgressiveStageResponse } from "@/lib/store";
import { ConfidenceSelector } from "./ConfidenceSelector";
import { ConfidenceLevel } from "@/lib/confidenceUtils";
import confidenceStyles from "./ConfidenceSelector.module.css";

interface ProgressiveReasoningFormProps {
  stageId: string;
  stageOrder: number;
  draft: ProgressiveStageDraft | undefined;
  onSaveDraft: (draft: ProgressiveStageDraft) => void;
  onSubmit: (response: Omit<ProgressiveStageResponse, "id" | "submittedAt">) => void;
}

export function ProgressiveReasoningForm({
  stageId,
  stageOrder,
  draft,
  onSaveDraft,
  onSubmit,
}: ProgressiveReasoningFormProps) {
  const isFirstStage = stageOrder === 1;

  const [leadingInterpretation, setLeadingInterpretation] = useState(draft?.leadingInterpretation || "");
  const [alternativeInterpretation, setAlternativeInterpretation] = useState(draft?.alternativeInterpretation || "");
  const [requestedInformation, setRequestedInformation] = useState(draft?.requestedInformation || "");
  const [mostImportantClue, setMostImportantClue] = useState(draft?.mostImportantClue || "");
  const [differentialChanged, setDifferentialChanged] = useState<ProgressiveStageDraft["differentialChanged"]>(
    draft?.differentialChanged || (isFirstStage ? "initial" : undefined)
  );
  const [changeExplanation, setChangeExplanation] = useState(draft?.changeExplanation || "");
  const [confidence, setConfidence] = useState<ProgressiveStageDraft["confidence"]>(draft?.confidence);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSaveDraft({
        stageId,
        leadingInterpretation,
        alternativeInterpretation,
        requestedInformation,
        mostImportantClue,
        differentialChanged,
        changeExplanation,
        confidence,
        updatedAt: new Date().toISOString(),
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [
    stageId, leadingInterpretation, alternativeInterpretation, 
    requestedInformation, mostImportantClue, differentialChanged, 
    changeExplanation, confidence, onSaveDraft
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!leadingInterpretation.trim()) newErrors.leadingInterpretation = "Enter your current leading interpretation.";
    if (!isFirstStage && !alternativeInterpretation.trim()) newErrors.alternativeInterpretation = "Enter an alternative interpretation.";
    if (!requestedInformation.trim()) newErrors.requestedInformation = "Describe what information you would request next.";
    if (!mostImportantClue.trim()) newErrors.mostImportantClue = "Identify the most important clue available so far.";
    
    if (!differentialChanged) {
      newErrors.differentialChanged = "Indicate whether your differential changed.";
    } else if ((differentialChanged === "yes" || differentialChanged === "uncertain") && !changeExplanation.trim()) {
      newErrors.changeExplanation = "Explain how your reasoning changed.";
    }
    
    if (!confidence) newErrors.confidence = "Select your confidence level.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus first error field loosely
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.focus();
      return;
    }

    onSubmit({
      stageId,
      stageOrder,
      leadingInterpretation: leadingInterpretation.trim(),
      alternativeInterpretation: alternativeInterpretation.trim(),
      requestedInformation: requestedInformation.trim(),
      mostImportantClue: mostImportantClue.trim(),
      differentialChanged: differentialChanged as "initial" | "yes" | "no" | "uncertain",
      changeExplanation: changeExplanation.trim(),
      confidence: confidence as "Low" | "Moderate" | "High",
    });
  };

  return (
    <form className={styles.reasoningForm} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>Record Your Reasoning</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="field-leadingInterpretation" className={styles.label}>Current leading interpretation</label>
        <textarea
          id="field-leadingInterpretation"
          className={`${styles.textarea} ${errors.leadingInterpretation ? styles.inputError : ''}`}
          placeholder="What is your leading educational interpretation at this stage?"
          value={leadingInterpretation}
          onChange={(e) => {
            setLeadingInterpretation(e.target.value);
            if (errors.leadingInterpretation) setErrors(prev => ({ ...prev, leadingInterpretation: "" }));
          }}
        />
        {errors.leadingInterpretation && <span className={styles.errorText}>{errors.leadingInterpretation}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="field-alternativeInterpretation" className={styles.label}>
          Alternative interpretation {isFirstStage && <span className={styles.optionalLabel}>(Optional)</span>}
        </label>
        <textarea
          id="field-alternativeInterpretation"
          className={`${styles.textarea} ${errors.alternativeInterpretation ? styles.inputError : ''}`}
          placeholder="What alternative are you currently considering?"
          value={alternativeInterpretation}
          onChange={(e) => {
            setAlternativeInterpretation(e.target.value);
            if (errors.alternativeInterpretation) setErrors(prev => ({ ...prev, alternativeInterpretation: "" }));
          }}
        />
        {errors.alternativeInterpretation && <span className={styles.errorText}>{errors.alternativeInterpretation}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="field-requestedInformation" className={styles.label}>Information you would request next</label>
        <textarea
          id="field-requestedInformation"
          className={`${styles.textarea} ${errors.requestedInformation ? styles.inputError : ''}`}
          placeholder="What history, examination, or investigation would help narrow your reasoning?"
          value={requestedInformation}
          onChange={(e) => {
            setRequestedInformation(e.target.value);
            if (errors.requestedInformation) setErrors(prev => ({ ...prev, requestedInformation: "" }));
          }}
        />
        {errors.requestedInformation && <span className={styles.errorText}>{errors.requestedInformation}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="field-mostImportantClue" className={styles.label}>Most important clue so far</label>
        <textarea
          id="field-mostImportantClue"
          className={`${styles.textarea} ${errors.mostImportantClue ? styles.inputError : ''}`}
          placeholder="Which available finding influenced your reasoning most?"
          value={mostImportantClue}
          onChange={(e) => {
            setMostImportantClue(e.target.value);
            if (errors.mostImportantClue) setErrors(prev => ({ ...prev, mostImportantClue: "" }));
          }}
        />
        {errors.mostImportantClue && <span className={styles.errorText}>{errors.mostImportantClue}</span>}
      </div>

      {!isFirstStage && (
        <>
          <fieldset className={confidenceStyles.confidenceSelector} id="field-differentialChanged">
            <div className={confidenceStyles.confidenceHeader}>
              <legend>Has your differential changed?</legend>
            </div>
            <div className={confidenceStyles.confidenceOptions}>
              {["yes", "no", "uncertain"].map((value) => {
                const isSelected = differentialChanged === value;
                
                let description = "";
                if (value === "yes") description = "My leading diagnosis or alternatives have shifted.";
                else if (value === "no") description = "My differential remains the same as before.";
                else if (value === "uncertain") description = "I need more information to decide.";

                return (
                  <label key={value} className={[
                    confidenceStyles.confidenceOption,
                    isSelected ? confidenceStyles.confidenceOptionSelected : ""
                  ].filter(Boolean).join(" ")}>
                    <input
                      type="radio"
                      name={`differential-change-${stageId}`}
                      value={value}
                      checked={isSelected}
                      onChange={() => {
                        setDifferentialChanged(value as any);
                        if (errors.differentialChanged) setErrors(prev => ({ ...prev, differentialChanged: "" }));
                      }}
                      className={confidenceStyles.radioInput}
                    />
                    <span className={confidenceStyles.confidenceOptionContent}>
                      <strong>{value.charAt(0).toUpperCase() + value.slice(1)}</strong>
                      <span>{description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.differentialChanged && <p className={confidenceStyles.confidenceError}>{errors.differentialChanged}</p>}
          </fieldset>

          {(differentialChanged === "yes" || differentialChanged === "uncertain") && (
            <div className={styles.formGroup}>
              <label htmlFor="field-changeExplanation" className={styles.label}>
                {differentialChanged === "yes" ? "Explain how your reasoning changed" : "What uncertainty remains?"}
              </label>
              <textarea
                id="field-changeExplanation"
                className={`${styles.textarea} ${errors.changeExplanation ? styles.inputError : ''}`}
                value={changeExplanation}
                onChange={(e) => {
                  setChangeExplanation(e.target.value);
                  if (errors.changeExplanation) setErrors(prev => ({ ...prev, changeExplanation: "" }));
                }}
              />
              {errors.changeExplanation && <span className={styles.errorText}>{errors.changeExplanation}</span>}
            </div>
          )}

          {differentialChanged === "no" && (
            <div className={styles.formGroup}>
              <label htmlFor="field-changeExplanation" className={styles.label}>
                Why did the new information not change your leading interpretation? <span className={styles.optionalLabel}>(Optional)</span>
              </label>
              <textarea
                id="field-changeExplanation"
                className={styles.textarea}
                value={changeExplanation}
                onChange={(e) => setChangeExplanation(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      <div className={styles.formGroup} id="field-confidence">
        <ConfidenceSelector
          value={confidence || null}
          onChange={(val: ConfidenceLevel) => {
            setConfidence(val);
            if (errors.confidence) setErrors(prev => ({ ...prev, confidence: "" }));
          }}
        />
        {errors.confidence && <span className={styles.errorText}>{errors.confidence}</span>}
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          Save Reasoning and Reveal Next Stage
        </button>
      </div>
    </form>
  );
}
