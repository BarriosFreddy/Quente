import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { PropTypes } from 'prop-types'

const PurchaseOrderTemplate = ({ purchaseOrder }) => (
  <Document title="orden-de-compra" pageLayout="oneColumn">
    <Page size="A4" style={styles.body}>
      <View style={styles.title}>
        <Text>ORDEN DE COMPRA</Text>
      </View>
      <View style={styles.info}>
        <Text>Fecha: 5/07/2023</Text>
        <Text>Solicitante: Droguería Francisca</Text>
        <Text>Proveedor: Distrireal de la costa</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRowHeader}>
          <View style={[styles.tableCol, { width: '70%' }]}>
            <Text style={styles.tableCell}>PRODUCTO</Text>
          </View>
          <View style={[styles.tableCol, { width: '15%' }]}>
            <Text style={styles.tableCell}>CANTIDAD</Text>
          </View>
          <View style={[styles.tableCol, { width: '15%' }]}>
            <Text style={styles.tableCell}>U. DE MEDIDA</Text>
          </View>
        </View>
        {console.log({ purchaseOrder })}
        {purchaseOrder?.items.map(({ name, units, measurementUnit }, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text style={styles.tableCell}>{name}</Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text style={styles.tableCell}>{units}</Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text style={styles.tableCell}>{measurementUnit}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
)

export default PurchaseOrderTemplate

PurchaseOrderTemplate.propTypes = {
  purchaseOrder: PropTypes.object,
}

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    margin: '20 0',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRowHeader: {
    margin: 'auto',
    flexDirection: 'row',
    fontWeight: 'bold',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    textAlign: 'left',
    margin: 'auto',
    marginTop: 5,
    fontSize: 11,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
})
