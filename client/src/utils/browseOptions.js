export const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest' },
];

export const RATING_OPTIONS = [
  { value: '6', label: '6+' },
  { value: '7', label: '7+' },
  { value: '8', label: '8+' },
];

export const RUNTIME_OPTIONS = [
  { value: 'short', label: 'Under 90 min' },
  { value: 'medium', label: '90–120 min' },
  { value: 'long', label: 'Over 120 min' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ro', label: 'Romanian' },
  { value: 'hi', label: 'Hindi' },
  { value: 'zh', label: 'Chinese' },
];

export function pickOption(value, options) {
  return options.some((option) => option.value === value) ? value : undefined;
}