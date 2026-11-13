import { useCallback, useEffect,useRef,useState } from "react";

export function useCarousel(columns,resetKey){
    const trackRef=useRef(null);
    const [edges,setEdges]=useState({prev: false, next:false});

    useEffect(()=> {
        const track=trackRef.current;
        if (!track) return undefined;

        track.scrollTo({left:0});

        function update() {
            const prev=track.scrollLeft > 4;
            const next=track.scrollLeft + track.clientWidth < track.scrollWidth-4;
            setEdges((current) => (current.prev === prev && current.next === next ? current : {prev,next}));
        }

        const observer=new ResizeObserver(update);
        observer.observe(track);
        track.addEventListener('scroll',update, {passive:true});

        return () =>{
            observer.disconnect();
            track.removeEventListener('scroll',update);
        };
    }, [resetKey]);

    const scrollPage=useCallback(
        (direction) => {
            const track=trackRef.current;
            const first=track?.children[0];
            if (!first) return;

            const second=track.children[1];
            const step=second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
            const reduceMotion= window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            track.scrollBy({
                left: direction * step*columns,
                behavior: reduceMotion ? 'auto' : 'smooth',
            });
        },
        [columns]
    );
    return {trackRef, canPrev: edges.prev, canNext: edges.next, scrollPage};
}