import './App.css'
// import { ICognatesConfig } from './types'
import { Route, Routes } from 'react-router-dom'
import Home from './screens/home/Home'
import About from './screens/about/About'
import NotFound from './screens/notFound/NotFound'
import Configure from './screens/configure/Configure'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/configure" element={<Configure />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default App
