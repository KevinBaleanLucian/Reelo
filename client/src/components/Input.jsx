import { useId, useState } from "react";
import './Input.css';

function EyeIcon({crossed}){
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {crossed && <path d="M3 3l18 18" />}
        </svg>
    );
}

function Input ({label, hint,error,type='text', id,className ='',...props}) {
    const generateId=useId();
    const inputId= id || generateId;
    const hintId= `${inputId}-hint`;
    const errorId= `${inputId}-error`;

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type ==='password';

    const describeBy=error ? errorId : hint ? hintId : undefined;

    const controlClasses=[
        'input__control',
        error ? 'input__control--error' : '',
        isPassword ? 'input__control--with-action' : '',
    ]
        .filter(Boolean).join(' ');
    return (
        <div className={`input ${className}`.trim()}>
            {label && (
                <label htmlFor={inputId} className="input__label">
                    {label}
                </label>
            )}
            <div className="input__wrap">
                <input
                    id={inputId}
                    type={isPassword && showPassword ? 'text' :type}
                    className={controlClasses}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describeBy}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        className="input__toggle"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                    >
                        <EyeIcon crossed={!showPassword} />
                    </button>
                )}
            </div>

        {error ? (
            <p id={errorId} className="input__error" role="alert">
                {error}
            </p>
        ) : hint ? (
            <p id={hintId} className="input__hint">
                {hint}
            </p>
        ) : null}
        </div>
    );
}

export default Input;