import * as React from 'react';

import type { AppearancePreference } from '@/lib/appearance';

type AppearanceControlProps = {
  value: AppearancePreference;
  onChange: (value: AppearancePreference) => void;
};

const options: AppearancePreference[] = ['system', 'light', 'dark'];

export function AppearanceControl({ value, onChange }: AppearanceControlProps) {
  return (
    <fieldset aria-label="Appearance" className="appearance-control" role="radiogroup">
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            name="appearance"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span>{option[0].toUpperCase() + option.slice(1)}</span>
        </label>
      ))}
    </fieldset>
  );
}
