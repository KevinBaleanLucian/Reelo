import { CheckIcon } from "./Icons.jsx";
import './Checkbox.css';

function Checkbox({label,className='' ,...props}){
    return (
        <label className={`checkbox ${className}`.trim()}>
            <input type="checkbox" className="checkbox__input" {...props}/>
            <span className="checkbox__box" aria-hidden="true">
                <CheckIcon size={14}/>
            </span>
            <span className="checkbox__label">{label}</span>
        </label>
    );
}

export default Checkbox;