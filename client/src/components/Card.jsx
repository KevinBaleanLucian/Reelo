import './Card.css';

function Card({
    as: Component = 'div',
    padding = 'md',
    interactive = false,
    className = '',
    children,
    ...props
}) {
    const classes =[
        'card',
        `card--pad-${padding}`,
        interactive ? 'card--interactive' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
}

export default Card;