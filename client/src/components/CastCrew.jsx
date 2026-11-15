import { profileUrl } from "../utils/images.js";
import './CastCrew.css';

function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

function CastCrew({crew,cast,limit=8}) {
    const people=[
    ...crew.map((person)=> ({
        key: `crew-${person.id}-${person.job}`,
        name: person.name,
        role: person.job,
        photo: person.profilePath,
    })),
    ...cast.map((person) => ({
        key: `cast-${person.id}`,
        name: person.name,
        role: person.character ? `as ${person.character}` : 'Actor',
        photo: person.profilePath,
    })),
    ].slice(0,limit);

    if(people.length === 0) {
        return <p className="cast-crew__empty">Cast information isn't available for this title yet</p>
    }

    return (
        <ul className="cast-crew__list">
            {people.map((person) => {
                const photo=profileUrl(person.photo);

                return (
                    <li key={person.key} className="cast-crew__person">
                        {photo ? (
                            <img src={photo} alt="" loading="lazy" className="cast-crew__photo" />
                        ) : (
                            <span className="cast-crew__photo cast-crew_photo--empty" aria-hidden="true">
                                {initials(person.name)}
                            </span>
                        )}
                        <span className="cast-crew__name">{person.name}</span> 
                        <span className="cast-crew__role">{person.role}</span>
                    </li>
                );
            })}
        </ul>
    );
}

export default CastCrew;