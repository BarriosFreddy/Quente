import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import dayjs from 'dayjs'
import { getBillingsGTDate, getBillingTopSales } from '../../services/billings.service'
import { formatCurrency } from '@quente/common/utils'
import { Helmet } from 'react-helmet'

const SALES_DAYS = [
  { label: 'Hoy', value: 0 },
  { label: 'Últimos 7 días', value: 6 },
]

const Dashboard = () => {
  const dispatch = useDispatch()
  const billingsGraph = useSelector((state) => state.billing.billingsGraph)
  const billingTopSales = useSelector((state) => state.billing.billingTopSales)
  const [days, setDays] = useState(0)
  const tenDaysBefore = dayjs().subtract(days, 'days').format('YYYY-MM-DD')
  useEffect(() => {
    dispatch(getBillingsGTDate(tenDaysBefore))
    dispatch(getBillingTopSales(tenDaysBefore))
  }, [dispatch, tenDaysBefore])
  const labels = billingsGraph ? billingsGraph.map(({ createdAt }) => createdAt) : []
  const data = billingsGraph ? billingsGraph.map(({ billAmount }) => billAmount) : []
  const topSalesLabels = billingTopSales ? billingTopSales.map(({ name }) => name) : []
  const topSalesData = billingTopSales ? billingTopSales.map(({ sales }) => sales) : []
  const dataReversed = [...billingsGraph].reverse()
  return (
    <>
      <CCard className="mb-4">
        <Helmet>
          <title>DASHBOARD</title>
        </Helmet>
        <CCardBody style={{ width: '90%', margin: 'auto' }}>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Ventas por día
              </h4>
            </CCol>
            <CCol sm={7}>
              <CButtonGroup className="float-end me-3">
                {SALES_DAYS.map(({ label, value }) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === days}
                    onClick={() => setDays(value)}
                  >
                    {label}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={{
              labels,
              datasets: [
                {
                  label: 'Venta',
                  backgroundColor: hexToRgba(getStyle('--cui-info'), 10),
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 2,
                  data,
                  fill: true,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: false,
                  },
                },
                y: {
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 5,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 1,
                  hitRadius: 10,
                  hoverRadius: 4,
                  hoverBorderWidth: 3,
                },
              },
            }}
          />
          <br />
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell className="text-center">Día</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Ventas</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {dataReversed.map(({ createdAt, billAmount }, index) => (
                <CTableRow key={index}>
                  <CTableDataCell className="text-center">{createdAt}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    {formatCurrency(billAmount)}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <br />
          <h4 className="card-title mb-0">Productos de mayor venta</h4>
          <CChartBar
            height={100}
            data={{
              labels: topSalesLabels,
              datasets: [
                {
                  label: 'Venta',
                  backgroundColor: '#0000aa',
                  maxBarThickness: 20,
                  data: topSalesData,
                },
              ],
            }}
            labels="items"
            options={{
              indexAxis: 'y',
              plugins: {
                legend: {
                  labels: {
                    color: getStyle('--cui-body-color'),
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    color: getStyle('--cui-border-color-translucent'),
                  },
                  ticks: {
                    color: getStyle('--cui-body-color'),
                  },
                },
                y: {
                  grid: {
                    color: getStyle('--cui-border-color-translucent'),
                  },
                  ticks: {
                    color: getStyle('--cui-body-color'),
                  },
                },
              },
            }}
          />
        </CCardBody>
        <CCardFooter></CCardFooter>
      </CCard>
    </>
  )
}

export default Dashboard
