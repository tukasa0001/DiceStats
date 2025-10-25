import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UploadForm from './UploadForm'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <UploadForm />
    </StrictMode>
)
