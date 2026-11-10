import {useParams} from 'react-router';

function TitleDetailsPage(){
    const {type,id}=useParams();

    return (
        <h1>
            TitleDetailsPage: {type} {id}
        </h1>
    );
}

export default TitleDetailsPage;