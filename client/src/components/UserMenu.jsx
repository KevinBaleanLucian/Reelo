import { useEffect,useId,useRef,useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { initials } from "../utils/user.js";
import './UserMenu.css';



function UserMenu(){
    const {user,logout}=useAuth();
    const panelId=useId();
    const rootRef=useRef(null);
    const buttonRef=useRef(null);
    const [open,setOpen]=useState(false);

    useEffect(() => {
        if(!open) return undefined;

        function closeWhenOutside(event){
            if(!rootRef.current?.contains(event.target)) setOpen(false);
        }

        document.addEventListener('pointerdown',closeWhenOutside);
        document.addEventListener('focusin',closeWhenOutside);

        return () =>{
            document.removeEventListener('pointerdown',closeWhenOutside);
            document.removeEventListener('focusin',closeWhenOutside);
        };
    }, [open]);

    if(!user) return null;

    function handleKeyDown(event){
        if(event.key==='Escape' && open) {
            event.preventDefault();
            setOpen(false);
            buttonRef.current?.focus();
        }
    }

    function handleLogout(){
        setOpen(false);
        logout();
    }
    return (
        <div className="user-menu" ref={rootRef} onKeyDown={handleKeyDown}>
            <button 
                ref={buttonRef}
                type="button"
                className="user-menu__button"
                aria-label="Account menu"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={(event) => {
                    event.currentTarget.focus();
                    setOpen((current) => !current);
                }}
            >
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="user-menu__avatar" />
                ) : (
                    initials(user)
                )}
            </button>

            {open && (
                <div id={panelId} className="user-menu__panel">
                    <div className="user-menu__identity">
                        <p className="user-menu__name">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="user-menu__handle">@{user.username}</p>
                    </div>

                    <Link to={`/profile/${encodeURIComponent(user.username)}`} className="user-menu__item" onClick={() => setOpen(false)}>
                        My profile
                    </Link>
                    <Link to="/chat" className="user-menu__item" onClick={() => setOpen(false)}>
                        Messages
                    </Link>
                    <button type="button" className="user-menu__item" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu;