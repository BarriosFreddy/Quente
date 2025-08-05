import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export const formatCurrency = (amount) => {
  return !isNaN(amount) && +amount >= 0
    ? new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(+amount)
    : amount
}

export const formatDate = (dateObject, format = 'DD-MM-YYYY hh:mm a') => {
  if (typeof dateObject === 'string') {
    return dayjs(dateObject).utcOffset(-300).format(format)
  }
  const { date, offset } = dateObject || {}
  if (!date || !offset) return ''
  return dayjs(date)
    .utcOffset(offset / 60000)
    .format(format)
}

export const getDateObject = () => {
  return {
    date: dayjs().utc().valueOf(),
    offset: dayjs().utcOffset() * 60000,
  }
}

export const getDateAsString = (format = 'YYYY-MM-DD') => {
  return dayjs().utcOffset(-5).format(format)
}

export const getUUID = () => {
  return uuidv4()
}

export const getMainPrice = (pricesRatio = []) => {
  const priceRatio = pricesRatio.find(({ main, hash }) => main === hash)
  return priceRatio?.price
}

export const getMainPriceRatio = (pricesRatio = []) => {
  const priceRatio = pricesRatio.find(({ main, hash }) => main === hash)
  return priceRatio
}
