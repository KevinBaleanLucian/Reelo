import './FilterTabs.css';

function FilterTabs({label,options,value,onChange}){
    return (
        <div className="filter-tabs" role="group" aria-label={label}>
            {options.map((option) => {
                const active=option.value===value;

                return (
                    <button key={option.value} type="button"
                        className={`filter-tabs__tab ${active ? 'filter-tabs__tab--active' : ''}`.trim()}
                        aria-pressed={active}
                        onClick={() => onChange(option.value)}
                        >
                            {option.label}
                        </button>
                );
            })}
        </div>
    );
}

export default FilterTabs;