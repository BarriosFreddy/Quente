import React, { useState, useEffect, Fragment, useCallback } from 'react'

import {
  CCard,
  CCardHeader,
  CCardFooter,
  CContainer,
  CRow,
  CButton,
  CCardBody,
  CCol,
  CFormInput,
  CTable,
  CTableRow,
  CTableDataCell,
  CTableBody,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { saveItemCategoriesBulk } from 'src/modules/billing/services/items.service'
import { setShowToast, setToastConfig } from 'src/app.slice'
import { setSaveSuccess } from '../../reducers/billings.reducer'
import { formatCurrency } from 'src/utils'

const LIMIT_5_MB = 5242880
function DataLoader() {
  const dispatch = useDispatch()
  const saveSuccess = useSelector((state) => state.items.saveSuccess)
  let [items, setItems] = useState([])
  let [feedbackInvalid, setFeedbackInvalid] = useState(null)

  const showSuccessfulPopup = useCallback(() => {
    dispatch(
      setToastConfig({
        message: 'Carga de datos exitosa',
        color: 'success',
      }),
    )
    dispatch(setShowToast(true))
    dispatch(setSaveSuccess(false))
    setItems([])
  }, [dispatch])

  useEffect(() => {
    saveSuccess && showSuccessfulPopup()
  }, [saveSuccess, showSuccessfulPopup])

  const handleChange = ({ target }) => {
    const file = target.files[0]
    const { size, type } = file
    if (type !== 'text/csv') {
      setFeedbackInvalid('El archivo debe ser tipo CSV')
      return
    }
    if (size > LIMIT_5_MB) {
      setFeedbackInvalid('El archivo no debe superar los 5 Megabytes')
      return
    }
    const fileReader = new FileReader()
    fileReader.readAsText(file)

    fileReader.onloadend = () => loadRows(fileReader.result)
    fileReader.onerror = (e) => {
      console.log(fileReader.result)
    }
  }

  const loadRows = (text) => {
    setItems([])
    const rows = text.split(/\n/)
    rows.shift() //Removes headers
    const items = rows
      .filter((line) => line.length > 0)
      .map((line) => {
        const fields = line.split(',')
        return {
          code: fields[0],
          name: fields[1],
          description: fields[2],
          price: fields[3],
          units: fields[4],
          measurementUnit: fields[5],
          expirationDate: fields[6],
          laboratory: fields[7],
        }
      })
    setItems(items)
  }

  const handleLoad = async () => {
    dispatch(saveItemCategoriesBulk(items))
  }

  return (
    <>
      <CContainer className="mt--6" fluid>
        <CRow>
          <div className="col">
            <CCard className="shadow border-10">
              <CCardHeader className="border-0">
                <CContainer>
                  <CRow>
                    <CCol xs="4"> </CCol>
                  </CRow>
                </CContainer>
              </CCardHeader>
              <CCardBody>
                <>
                  <CCard
                    style={{
                      width: 'auto',
                    }}
                  >
                    <CCardBody>
                      <CRow>
                        <CCol xs="12">
                          <div className="mb-3">
                            <CFormInput
                              type="file"
                              id="formFile"
                              label="Cargar datos"
                              onChange={handleChange}
                              feedbackInvalid={feedbackInvalid}
                              invalid={!!feedbackInvalid}
                              required
                            />
                          </div>
                        </CCol>
                        <CCol xs="12">
                          <CButton
                            color="success"
                            type="button"
                            disabled={items.length <= 0}
                            onClick={handleLoad}
                          >
                            Cargar datos
                          </CButton>
                        </CCol>
                      </CRow>
                      <div className="d-lg-none">
                        {items.map(({ code, name, description, units }) => (
                          <CCard className="shadow mt-1" key={code}>
                            <CCardBody>
                              <CRow>
                                <CCol xs="12" className="text-uppercase">
                                  {name}
                                </CCol>
                                <CCol className="fs-6" xs="12">
                                  {code}
                                </CCol>
                                <CCol xs="12" className="text-break">
                                  {description}
                                </CCol>
                                <CCol xs="12">{units}</CCol>
                              </CRow>
                            </CCardBody>
                          </CCard>
                        ))}
                      </div>
                      <div className="d-none d-lg-block">
                        <CTable>
                          <CTableBody>
                            {items.map(
                              ({
                                code,
                                name,
                                description,
                                price,
                                units,
                                measurementUnit,
                                expirationDate,
                                laboratory,
                              }) => (
                                <CTableRow key={code}>
                                  <CTableDataCell xs="12" className="text-uppercase">
                                    {name}
                                  </CTableDataCell>
                                  <CTableDataCell className="fs-6" xs="12">
                                    {code}
                                  </CTableDataCell>
                                  <CTableDataCell xs="12" className="text-break">
                                    {description}
                                  </CTableDataCell>
                                  <CTableDataCell xs="12">{formatCurrency(price)}</CTableDataCell>
                                  <CTableDataCell xs="12">{units}</CTableDataCell>
                                  <CTableDataCell xs="12">{measurementUnit}</CTableDataCell>
                                  <CTableDataCell xs="12">{expirationDate}</CTableDataCell>
                                  <CTableDataCell xs="12">{laboratory}</CTableDataCell>
                                </CTableRow>
                              ),
                            )}
                          </CTableBody>
                        </CTable>
                      </div>
                    </CCardBody>
                  </CCard>
                  <CCardFooter className="py-4">
                    <CCol></CCol>
                  </CCardFooter>
                </>
              </CCardBody>
            </CCard>
          </div>
        </CRow>
      </CContainer>
    </>
  )
}

export default DataLoader
