/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'

export const useDidUpdate = (callback, dependecies) => {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) {
      return callback()
    } else {
      mounted.current = true
    }
  }, dependecies)
}
