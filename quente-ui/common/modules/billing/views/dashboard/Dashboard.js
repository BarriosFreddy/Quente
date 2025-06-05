import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CProgressBar,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsB,
  CWidgetStatsC,
  CWidgetStatsF,
} from "@coreui/react";
import { CChartBar, CChartDoughnut, CChartLine, CChartPie } from "@coreui/react-chartjs";
import { getStyle, hexToRgba } from "@coreui/utils";
import CIcon from "@coreui/icons-react";
import {
  cilCart,
  cilCash,
  cilChartPie,
  cilCloudDownload,
  cilWarning,
  cilBasket,
  cilStorage,
} from "@coreui/icons";
import dayjs from "dayjs";
import {
  getBillingsGTDate,
  getBillingTopSales,
} from "../../services/billings.service";
import { getDashboardStats } from "../../services/dashboard.service";
import { formatCurrency } from "@quente/common/utils";
import { Helmet } from "react-helmet";

const SALES_DAYS = [
  { label: "Hoy", value: 0 },
  { label: "Últimos 7 días", value: 6 },
  { label: "Últimos 30 días", value: 29 },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const billingsGraph = useSelector((state) => state.billing.billingsGraph);
  const billingTopSales = useSelector((state) => state.billing.billingTopSales);
  const dashboardStats = useSelector((state) => state.dashboard.stats);
  const dashboardLoading = useSelector((state) => state.dashboard.loading);
  const [days, setDays] = useState(0);
  const tenDaysBefore = dayjs().subtract(days, "days").format("YYYY-MM-DD");

  useEffect(() => {
    dispatch(getBillingsGTDate(tenDaysBefore));
    dispatch(getBillingTopSales(tenDaysBefore));
    dispatch(getDashboardStats(tenDaysBefore));
  }, [dispatch, tenDaysBefore]);

  const labels = billingsGraph
    ? billingsGraph.map(({ createdAt }) => createdAt)
    : [];
  const data = billingsGraph
    ? billingsGraph.map(({ billAmount }) => billAmount)
    : [];
  const topSalesLabels = billingTopSales
    ? billingTopSales.map(({ name }) => name)
    : [];
  const topSalesData = billingTopSales
    ? billingTopSales.map(({ sales }) => sales)
    : [];
  const dataReversed = [...billingsGraph].reverse();

  // Extract stock by category data for the doughnut chart
  const categoryLabels =
    dashboardStats?.stockByCategory?.map((cat) => cat.name) || [];
  const categoryData =
    dashboardStats?.stockByCategory?.map((cat) => cat.stock) || [];
  return (
    <>
      <Helmet>
        <title>TABLERO</title>
      </Helmet>

      <CCard className="my-2 mx-5">
        <CCardHeader>
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
        </CCardHeader>
        <CCardBody style={{ width: "90%", margin: "auto" }}>
          {/* Summary Stats Widgets */}
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CWidgetStatsC
                className="mb-3"
                icon={<CIcon icon={cilCart} color="#fff" height={36} />}
                color="primary"
                inverse
                title="Artículos Totales"
                value={dashboardStats?.totalItems?.toLocaleString()}
                progress={{
                  value: Math.min(
                    100,
                    Math.round((dashboardStats?.totalItems / 1000) * 100)
                  ),
                }}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsC
                loading={dashboardLoading}
                className="mb-3"
                icon={<CIcon icon={cilStorage} height={36} />}
                color="info"
                inverse
                title="Inventario Actual"
                value={dashboardStats?.currentStock?.toLocaleString()}
                progress={{
                  value: Math.min(
                    100,
                    Math.round((dashboardStats?.currentStock / 5000) * 100)
                  ),
                }}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsC
                loading={dashboardLoading}
                className="mb-3"
                icon={<CIcon icon={cilCash} height={36} />}
                color="success"
                inverse
                title="Ingresos Totales"
                value={formatCurrency(dashboardStats?.totalRevenue)}
                progress={{
                  value: Math.min(
                    100,
                    Math.round((dashboardStats?.totalRevenue / 50000) * 100)
                  ),
                }}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsC
                loading={dashboardLoading}
                className="mb-3"
                icon={<CIcon icon={cilBasket} height={36} />}
                color="warning"
                inverse
                title="Número de Facturaciones"
                value={dashboardStats?.numberOfBillings?.toLocaleString()}
                progress={{
                  value: Math.min(
                    100,
                    Math.round((dashboardStats?.numberOfBillings / 100) * 100)
                  ),
                }}
              />
            </CCol>
          </CRow>
          <CChartLine
            loading={dashboardLoading}
            style={{ height: "300px", marginTop: "40px" }}
            data={{
              labels,
              datasets: [
                {
                  label: "Venta",
                  backgroundColor: hexToRgba(getStyle("--cui-info"), 10),
                  borderColor: getStyle("--cui-info"),
                  pointHoverBackgroundColor: getStyle("--cui-info"),
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
          {/* Stock by Category Chart */}
          <CRow className="mb-4">
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader>
                  <h4>Estado del Inventario por Categoría</h4>
                </CCardHeader>
                <CCardBody>
                  <CChartDoughnut
                    loading={dashboardLoading}
                    data={{
                      labels: categoryLabels,
                      datasets: [
                        {
                          backgroundColor: [
                            "#3399FF",
                            "#41B883",
                            "#E46651",
                            "#DD1B16",
                            "#6610F2",
                            "#20C997",
                            "#FD7E14",
                            "#FFC107",
                          ],
                          data: categoryData,
                        },
                      ],
                    }}
                  />
                  <div className="mt-4">
                    {dashboardStats?.stockByCategory?.map((category, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <div>{category.name}</div>
                          <div>
                            <strong>{category.stock.toLocaleString()}</strong>{" "}
                            unidades ({category.itemCount} artículos)
                          </div>
                        </div>
                        <CProgress className="progress-xs">
                          <CProgressBar
                            color={
                              index % 8 === 0
                                ? "primary"
                                : index % 8 === 1
                                ? "success"
                                : index % 8 === 2
                                ? "danger"
                                : index % 8 === 3
                                ? "warning"
                                : index % 8 === 4
                                ? "info"
                                : index % 8 === 5
                                ? "dark"
                                : index % 8 === 6
                                ? "secondary"
                                : "light"
                            }
                            value={Math.min(
                              100,
                              Math.round(
                                (category.stock /
                                  (dashboardStats.currentStock || 1)) *
                                  100
                              )
                            )}
                          />
                        </CProgress>
                      </div>
                    ))}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Payment Methods Chart */}
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader>
                  <h4>
                    <CIcon icon={cilChartPie} className="text-primary" /> Ventas por Método de Pago
                  </h4>
                </CCardHeader>
                <CCardBody>
                  <CChartDoughnut
                    loading={dashboardLoading}
                    data={{
                      labels: dashboardStats?.billingsByPaymentMethod?.map(item => item.method) || [],
                      datasets: [
                        {
                          backgroundColor: [
                            "#3399FF", // Primary - Efectivo
                            "#41B883", // Success - Transferencia
                            "#E46651", // Danger - Tarjeta de crédito
                            "#FFC107", // Warning - Cheque
                            "#6610F2", // Purple - Otro método
                            "#20C997", // Teal - Otro método
                            "#FD7E14", // Orange - Otro método
                            "#6C757D", // Secondary - Otro método
                          ],
                          data: dashboardStats?.billingsByPaymentMethod?.map(item => item.amount) || [],
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = formatCurrency(context.raw);
                              const dataset = context.dataset;
                              const total = dataset.data.reduce((acc, data) => acc + data, 0);
                              const percentage = Math.round((context.raw / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                  <div className="mt-4">
                    {dashboardStats?.billingsByPaymentMethod?.map((method, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <div>{method.method}</div>
                          <div>
                            <strong>{formatCurrency(method.amount)}</strong>{" "}
                            ({method.count} facturaciones)
                          </div>
                        </div>
                        <CProgress className="progress-xs">
                          <CProgressBar
                            color={
                              index % 8 === 0
                                ? "primary"
                                : index % 8 === 1
                                ? "success"
                                : index % 8 === 2
                                ? "danger"
                                : index % 8 === 3
                                ? "warning"
                                : index % 8 === 4
                                ? "info"
                                : index % 8 === 5
                                ? "dark"
                                : index % 8 === 6
                                ? "secondary"
                                : "light"
                            }
                            value={Math.min(
                              100,
                              Math.round(
                                (method.amount /
                                  (dashboardStats.totalRevenue || 1)) *
                                  100
                              )
                            )}
                          />
                        </CProgress>
                      </div>
                    ))}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            
            {/* Low Stock Items Widget */}
            <CCol md={4}>
              <CCard className="mb-4">
                <CCardHeader>
                  <h4>
                    <CIcon icon={cilWarning} className="text-warning" /> Artículos con
                    Poco Inventario
                  </h4>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive small style={{ fontSize: '0.85rem' }}>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Código</CTableHeaderCell>
                        <CTableHeaderCell>Nombre</CTableHeaderCell>
                        <CTableHeaderCell>Inventario Actual</CTableHeaderCell>
                        <CTableHeaderCell>Punto de Reorden</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {dashboardStats?.lowStockItems?.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <strong>{item.code}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{item.name}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            {item.currentStock}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            {item.reorderPoint}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CProgress height={10}>
                              <CProgressBar
                                color={
                                  item.currentStock === 0
                                    ? "danger"
                                    : item.currentStock < item.reorderPoint / 2
                                    ? "warning"
                                    : "info"
                                }
                                value={Math.min(
                                  100,
                                  Math.round(
                                    (item.currentStock /
                                      (item.reorderPoint || 1)) *
                                      100
                                  )
                                )}
                              />
                            </CProgress>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell className="text-center">Día</CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Ventas
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {dataReversed.map(({ createdAt, billAmount }, index) => (
                <CTableRow key={index}>
                  <CTableDataCell className="text-center">
                    {createdAt}
                  </CTableDataCell>
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
                  label: "Venta",
                  backgroundColor: "#0000aa",
                  maxBarThickness: 20,
                  data: topSalesData,
                },
              ],
            }}
            labels="items"
            options={{
              indexAxis: "y",
              plugins: {
                legend: {
                  labels: {
                    color: getStyle("--cui-body-color"),
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    color: getStyle("--cui-border-color-translucent"),
                  },
                  ticks: {
                    color: getStyle("--cui-body-color"),
                  },
                },
                y: {
                  grid: {
                    color: getStyle("--cui-border-color-translucent"),
                  },
                  ticks: {
                    color: getStyle("--cui-body-color"),
                  },
                },
              },
            }}
          />
        </CCardBody>
        <CCardFooter></CCardFooter>
      </CCard>
    </>
  );
};

export default Dashboard;
