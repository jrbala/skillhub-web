import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const DESCRIPTION_DEFAUT = 'Développez vos compétences avec les ateliers SkillHub et retrouvez vos inscriptions dans votre espace personnel.'

interface PropsTitreDeVue {
  children: string
  titreDocument?: string
  description?: string
  className?: string
}

export default function TitreDeVue({
  children,
  titreDocument,
  description = DESCRIPTION_DEFAUT,
  className,
}: PropsTitreDeVue) {
  const { pathname, hash } = useLocation()
  const ancre = useRef<HTMLHeadingElement>(null)
  const titre = titreDocument ?? children

  useEffect(() => {
    document.title = `${titre} — SkillHub`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [titre, description])

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
    ancre.current?.focus()
  }, [pathname, hash])

  return (
    <>
      <h1 ref={ancre} tabIndex={-1} className={className}>
        {children}
      </h1>
      <span className="sr-only" role="status" aria-live="polite">
        {titre}
      </span>
    </>
  )
}
