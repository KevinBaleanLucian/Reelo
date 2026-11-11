import { Link } from "react-router";
import './Button.css';

function Button({variant ='primary', fullWidth=false, to, className='',children, ...props}){
    const classes=['btn', `btn--${variant}`, fullWidth ? 'btn--full' : '', className]
    .filter(Boolean).join(' ');

    if (to){
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} {...props}>
            {children}
        </button>
    );

}

export default Button;