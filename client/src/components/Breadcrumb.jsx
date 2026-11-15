import { Link } from "react-router";
import { ChevronRightIcon } from "./Icons.jsx";
import './Breadcrumb.css';

function Breadcrumb ({items}) {
    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb__list">
                {items.map((item,index) => {
                    const last=index === item.length-1;

                    return (
                        <li key={`${index}-${item.label}`} className="breadcrumb__item">
                            {last ? (
                                <span className="breadcrumb__current" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <>
                                    <Link to={item.to} className="breadcrumb__link">
                                        {item.label}
                                    </Link>
                                    <ChevronRightIcon size={14} />
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumb;