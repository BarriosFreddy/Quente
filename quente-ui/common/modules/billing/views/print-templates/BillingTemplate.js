import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { PropTypes } from "prop-types";
import { formatCurrency } from "@quente/common/utils";

const BillingTemplate = ({ billing, organization }) => (
  <Document title="factura" pageLayout="oneColumn">
    <Page size="A7" wrap={false} style={styles.body}>
      <View style={styles.title}>
        <Text>{organization?.name?.toUpperCase()}</Text>
        <Text>{`NIT: ${organization?.nit?.toUpperCase()}`}</Text>
        <Text>{organization?.address?.toUpperCase()}</Text>
        <Text>{`${organization?.city?.toUpperCase()} - ${organization?.country?.toUpperCase()}`}</Text>
        <Text>FACTURA DE VENTA</Text>
      </View>
      <View style={styles.info}>
        <Text>CÓDIGO: {billing.code}</Text>
        <Text>FECHA: {billing.creationDate}</Text>
        <Text>VENDEDOR: ANÓNIMO</Text>
        <Text>CLIENTE: ANÓNIMO</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={{ ...styles.tableCol, width: "50%" }}>PRODUCTO</Text>
        <Text style={{ ...styles.tableCol, width: "20%" }}>CNT</Text>
        <Text style={{ ...styles.tableCol, width: "30%", textAlign: "right" }}>V. U.</Text>
      </View>
      <View style={styles.table}>
        {billing?.items.map(({ name, units, price }, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: "50%" }}>
              <Text style={styles.tableCell}>{name}</Text>
            </View>
            <View style={{ ...styles.tableCol, width: "20%" }}>
              <Text style={styles.tableCell}>{units}</Text>
            </View>
            <View style={{ ...styles.tableCol, width: "30%" }}>
              <Text style={styles.tableCell}>{formatCurrency(price)}</Text>
            </View>
          </View>
        ))}
        <View style={{ ...styles.tableRow, ...styles.marginBottom10 }}>
          <View style={{ ...styles.tableCol, width: "50%" }}>
            <Text style={styles.tableCell}>&nbsp;</Text>
          </View>
          <View style={{ ...styles.tableCol, width: "20%" }}>
            <Text style={styles.tableCell}>TOTAL</Text>
          </View>
          <View style={{ ...styles.tableCol, width: "30%" }}>
            <Text style={styles.tableCell}>
              {formatCurrency(billing.billAmount)}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ ...styles.textCenter, ...styles.marginBottom10 }}>
        <Text>SERVICIO A DOMICILIO</Text>
        <Text>{organization?.phoneNumber?.toUpperCase()}</Text>
        <Text>** GRACIAS POR SU COMPRA **</Text>
      </View>
    </Page>
  </Document>
);

export default BillingTemplate;

BillingTemplate.propTypes = {
  billing: PropTypes.object,
};

const styles = StyleSheet.create({
  body: {
    fontSize: 8,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  title: {
    textAlign: "center",
  },
  info: {
    margin: "10 0",
  },
  table: {
    display: "table",
    width: "auto",
  },
  tableRowHeader: {
    flexDirection: "row",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "auto",
  },
  tableCell: {
    textAlign: "left",
    marginTop: 5,
    fontSize: 9,
  },
  textCenter: {
    textAlign: "center",
  },
  marginBottom10: {
    marginBottom: 10,
  },
});
