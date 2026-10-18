// Desktop entry for the station page (the website renders the same component through Next).
import {createRoot} from 'react-dom/client';
import Radio from '../../../app/radio/radio';
createRoot(document.getElementById('root')!).render(<Radio/>);
