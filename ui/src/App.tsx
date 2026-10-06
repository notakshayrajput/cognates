// import { ICognatesConfig } from './types'
import { Route, Routes } from 'react-router-dom'
import Home from './screens/home/Home'
import About from './screens/about/About'
import NotFound from './screens/notFound/NotFound'
import Configure from './screens/configure/Configure'
import Localize from './screens/localize/Localize'
import Test from './screens/test/Test'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/configure" element={<Configure />} />
            <Route path="/localize" element={<Localize />} />
            <Route path="/about" element={<About />} />
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default App
