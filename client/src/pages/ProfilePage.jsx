import { useParams } from "react-router";

function ProfilePage(){
    const {username} =useParams();

    return <h1>ProfilePage: {username}</h1>;
}

export default ProfilePage;