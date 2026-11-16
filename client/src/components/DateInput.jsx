import Input from './Input.jsx';
import { maskDate } from '../utils/birthDate.js';

function DateInput({ value, onChange, ...props }) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="DD / MM / YYYY"
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(maskDate(event.target.value))}
      {...props}
    />
  );
}

export default DateInput;