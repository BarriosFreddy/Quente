/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'

/**
 *
 * @param {function} callback
 * @param {boolean} controlVariable
 * @param {[Object]} dependecies
 */
export const useDidUpdateControl = (callback, controlVariable, dependecies = []) => {
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!loadingRef.current && controlVariable) {
      loadingRef.current = controlVariable
    } else if (loadingRef.current && !controlVariable) {
      callback()
    }
  }, [controlVariable, ...dependecies])
}
