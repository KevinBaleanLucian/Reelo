import { useCallback, useEffect,useState } from "react";
import { getTitleDetails } from "../services/titleApi.js";

export function useTitleDetails(type,id) {
    const [attempt, setAttempt]=useState(0);
    const [result,setResult]=useState({key: null, title:null, error:null});

    const key=`${type}:${id}:${attempt}`;

    useEffect(() => {
        let active=true;

        getTitleDetails(type,id)
            .then((title) => {
                if(active) setResult({key,title,error: null});
            })
            .catch((error) => {
                if(!active) return;
                const status=error.response?.status;
                setResult({
                    key,
                    title: null,
                    error: status === 404 || status === 400 ? 'not-found' : 'failed',
                });
            });

            return () =>{
                active=false;
            };
    }, [key,type,id]);

    const retry=useCallback(() => setAttempt((n) => n+1), []);

    let status='loading';
    if(result.key===key){
        status = result.error ==='not-found' ? 'not-found' : result.error ? 'error' : 'ready';
    }

    return { title: status ==='ready' ? result.title : null,status,retry};
}