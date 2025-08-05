import React from "react";
import { PropTypes } from "prop-types";
import { formatCurrency } from "@/utils";
import "./bill-template.css";

const BillTemplate = ({ billing }) => (
  <div className="bill-container">
    <div className="title">
      <p>DROGUERÍA FRANCISCA</p>
      <p>NIT: 12245132312</p>
      <p>OLAYA H. CRA 54 CLL 37 34-143</p>
      <p>CARTAGENA DE INDIAS - COLOMBIA</p>
      <p>FACTURA DE VENTA</p>
    </div>
    <div className="info">
      <p>CÓDIGO: {billing?.code}</p>
      <p>FECHA: {billing?.creationDate}</p>
      <p>VENDEDOR: ANÓNIMO</p>
      <p>CLIENTE: ANÓNIMO</p>
    </div>
    <div className="header">
      <p>PRODUCTO</p>
      <p>CNT</p>
      <p>V. U.</p>
    </div>
    <div className="items">
      {billing?.items.map(({ name, units, price }, i) => (
        <div key={i}>
          <div>
            <p>{name}</p>
          </div>
          <div>
            <p>{units}</p>
          </div>
          <div>
            <p>{formatCurrency(price)}</p>
          </div>
        </div>
      ))}
      <div className="bill-subtotal">
        <div>
          <p>&nbsp;</p>
        </div>
        <div>
          <p>TOTAL</p>
        </div>
        <div>
          <p>{formatCurrency(billing?.billAmount)}</p>
        </div>
      </div>
    </div>
    <div className="bill-footer">
      <p>SERVICIO A DOMICILIO</p>
      <p>3012141263</p>
      <p>** GRACIAS POR SU COMPRA **</p>
    </div>
  </div>
);

export default BillTemplate;

BillTemplate.propTypes = {
  billing: PropTypes.object,
};
