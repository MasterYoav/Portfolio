import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import type { AppearancePreference } from '@/lib/appearance';

type AppearanceControlProps = {
  value: AppearancePreference;
  onChange: (value: AppearancePreference) => void;
};

const options: AppearancePreference[] = ['system', 'light', 'dark'];
const optionMeta = {
  system: { label: 'System', title: 'Use system appearance', Icon: Monitor },
  light: { label: 'Light', title: 'Use light appearance', Icon: Sun },
  dark: { label: 'Dark', title: 'Use dark appearance', Icon: Moon },
} as const;

export function AppearanceControl({ value, onChange }: AppearanceControlProps) {
  return (
    <fieldset aria-label="Appearance" className="appearance-control" role="radiogroup">
      {options.map((option) => {
        const { Icon, label, title } = optionMeta[option];
        return (
        <label key={option} title={title}>
          <input
            type="radio"
            name="appearance"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span aria-hidden="true"><Icon size={19} strokeWidth={2} /></span>
          <span className="sr-only">{label}</span>
        </label>
        );
      })}
    </fieldset>
  );
}
