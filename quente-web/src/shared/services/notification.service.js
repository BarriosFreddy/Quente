import { setShowToast, setToastConfig } from '@/app.slice'

export const sendWarningToast = (dispatch, { message, delay = 2000 }) => {
  sendToast(dispatch, { message, color: 'warning', delay })
}

export const sendSuccessToast = (dispatch, { message, delay = 2000 }) => {
  sendToast(dispatch, { message, color: 'success', delay })
}

export const sendDangerToast = (dispatch, { message, delay = 2000 }) => {
  sendToast(dispatch, { message, color: 'danger', delay })
}

export const sendToast = (dispatch, { message, color = 'success', delay = 2000 }) => {
  if (!message) console.error('Toast notification must have a message')
  dispatch(
    setToastConfig({
      message,
      color,
      delay,
    }),
  )
  dispatch(setShowToast(true))
}
