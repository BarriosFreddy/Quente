import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Payment from './Payment'
import * as utils from '@/utils'

jest.spyOn(utils, 'formatCurrency')

function setReceivedAmount() {}
const props = {
  total: 0,
  setReceivedAmount,
}
test('Payment component', async () => {
  render(<Payment {...props}></Payment>)
  expect(screen.getByText('CAMBIO')).toBeDefined()
  expect(screen.getByText('RECIBIDO')).toBeDefined()
  await userEvent.click(screen.getByText('$ 2.000'))
  expect(screen.getByTestId('receivedAmountId').value).toBe('2000')
})
