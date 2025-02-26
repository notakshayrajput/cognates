import { useState } from 'react'
import './App.css'
import { ICognatesConfig } from './types'

function App() {
    const [config, setConfig] = useState({
        languages: ['en'],
    } as ICognatesConfig)

    return (
        <div className="App">
            <h1>Cognates Config Manager</h1>
            <button onClick={() => setConfig({ languages: ['en', 'es'] })}>
                Load Config
            </button>
            {config && <pre>{JSON.stringify(config, null, 2)}</pre>}
        </div>
    )
}

export default App
