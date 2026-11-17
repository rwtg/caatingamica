import { useEffect, useState } from 'react'
import focosUrl from './focos-inpe.json?url'

let cache = null

export default function useFocos() {
  const [focos, setFocos] = useState(cache)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (cache) return
    let cancelled = false
    fetch(focosUrl)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text() })
      .then((t) => {
        const json = JSON.parse(t.replace(/^﻿/, ''))
        cache = json
        if (!cancelled) setFocos(json)
      })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])
  return { focos, error }
}
