import { useEffect,useRef,useState } from "react";
import { ArrowUpRightIcon,PlayIcon } from "./Icons.jsx";
import { backdropUrl } from "../utils/images.js";
import './Trailer.css';

function Trailer({trailer,title,backdropPath}) {
    const [playing,setPlaying]=useState(false);
    const frameRef=useRef(null);
    const cover= backdropUrl(backdropPath,'w780');

    useEffect(() => {
        if (playing) frameRef.current?.focus();
    }, [playing]);

    return (
        <section id="trailer" className="trailer" aria-labelledby="trailer-heading">
            <h2 id="trailer-heading" className="eyebrow trailer__heading">
                Trailer
            </h2>

            <div className="trailer__player">
                {playing ? (
                    <iframe
                        ref={frameRef}
                        className="trailer__frame"
                        src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&playsinline=1`}
                        title={`${title} - ${trailer.name}`}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                    />

                 ) :(
                    <button type="button" className="trailer__play" onClick={() => setPlaying(true)}>
                        {cover && <img src={cover} alt="" className="trailer__cover" />}

                        <span className="trailer__button" aria-hidden="true">
                            <PlayIcon size={28} fill="currentColor" />
                        </span>

                        <span className="visually-hidden">Play trailer for {title}</span>
                        <span className="trailer__note" aria-hidden="true">
                            Plays on YouTube
                        </span>
                    </button>
                 )}
            </div>

            <a className="trailer__link"
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
            >  Watch on YouTube
                <ArrowUpRightIcon size={16}/>
                <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
        </section>
    );
}

export default Trailer;