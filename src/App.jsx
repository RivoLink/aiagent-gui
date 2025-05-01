import AiAgent from '@app/core/AiAgent';
import Home from '@app/components/screens/Home/Home';

import './App.css';

function App() {
    AiAgent.Session.load();

    return (
        <Home />
    )
}

export default App;
