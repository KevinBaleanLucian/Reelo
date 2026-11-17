let locks=0;

export function lockScroll() {
    locks+=1;
    document.documentElement.classList.add('scroll-locked');

    let released=false;

    return () => {
        if(released) return;
        released=true;
        locks-=1;

        if(locks===0){
            document.documentElement.classList.remove('scroll-locked');
        }
    };
}