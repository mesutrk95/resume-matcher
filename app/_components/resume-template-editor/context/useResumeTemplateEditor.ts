import { useContext } from "react"
import { ResumeTemplateEditorContext } from "./ResumeTemplateEditorProvider"

 
export const useResumeTemplateEditor = () => {
    return useContext(ResumeTemplateEditorContext)
}
