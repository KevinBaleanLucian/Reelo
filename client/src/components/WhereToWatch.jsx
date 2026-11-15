import { ArrowUpRightIcon } from "./Icons.jsx";
import { formatRegionName } from "../utils/format.js";
import { logoUrl } from "../utils/images.js";
import './WhereToWatch.css';

const GROUPS = [
  { key: 'stream', label: 'Stream' },
  { key: 'free', label: 'Free' },
  { key: 'ads', label: 'Free with ads' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
];

const MAX_PER_GROUP = 6;

function WhereToWatch({watch}) {
    const regionName=formatRegionName(watch.region);

    const groups=GROUPS.map((group) => ({
        ...group,
        providers: watch.groups[group.key] || [],
    })).filter((group) => group.providers.length>0);

    return (
        <div className="where-to-watch">
            {groups.length ===0 ? (
                <p className="where-to-watch__empty">No streaming options found in {regionName}</p>
            ): (
                <div className="where-to-watch__groups">
                    {groups.map((group) => {
                        const shown=group.providers.slice(0,MAX_PER_GROUP);
                        const hidden=group.providers.length - shown.length;

                        return (
                            <section key={group.key} className="where-to-watch__group">
                                <h3 className="where-to-watch__label">{group.label}</h3>

                                <ul className="where-to-watch__list">
                                    {shown.map((provider) => {
                                        const logo=logoUrl(provider.logoPath);

                                        return (
                                            <li key={provider.id} className="where-to-watch__provider">
                                                {logo ? (
                                                    <img src={logo} alt="" loading="lazy" className="where-to-watch__logo" />
                                                ) : (
                                                    <span className="where-to-watch__logo" aria-hidden="true" />
                                                )}
                                                {provider.name}
                                            </li>
                                        );
                                    })}

                                    {hidden > 0 && <li className="where-to-watch__more">+{hidden} more</li>}
                                </ul>
                            </section>
                        );
                    })}
                </div>
            )}

            <p className="where-to-watch__note">
                Availability in {regionName}, provided by {' '}
                <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer">
                    JustWatch
                </a>
                . It can be incomplete or out of date.
            </p>

            {watch.link && (
                <a href={watch.link} target="_blank" rel="noopener noreferrer" className="where-to-watch__link">
                    More options on TMDB
                    <ArrowUpRightIcon size={16} />
                    <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
            )}
        </div>
    );
}

export default WhereToWatch;