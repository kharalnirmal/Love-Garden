"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./choice-group.module.css";

interface ChoiceGroupProps<T extends string> {
  name: string;
  legend: string;
  value: T;
  options: { value: T; label: string; preview: ReactNode }[];
  onChange: (value: T) => void;
  compact?: boolean;
  hideLegend?: boolean;
  className?: string;
}

export default function ChoiceGroup<T extends string>({ name, legend, value, options, onChange, compact, hideLegend, className = "" }: ChoiceGroupProps<T>) {
  return (
    <fieldset className={`${styles.group} ${className}`} data-compact={compact || undefined}>
      <legend className={hideLegend ? "sr-only" : styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => <label key={option.value} className={styles.option} data-selected={value === option.value}>
          <input className={styles.input} type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          <span className={styles.preview} aria-hidden="true">{option.preview}</span>
          <span>{option.label}</span>
          {value === option.value && <Check className={styles.check} size={11} aria-hidden="true" />}
        </label>)}
      </div>
    </fieldset>
  );
}
