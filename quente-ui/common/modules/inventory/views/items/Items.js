import React, { useState, useEffect, useRef } from "react";

import {
  CCard,
  CCardHeader,
  CContainer,
  CRow,
  CButton,
  CCardBody,
  CCol,
  CInputGroup,
  CFormInput,
  CFormSelect,
  CFormLabel,
} from "@coreui/react";
import ItemForm from "./ItemForm";
import { useDispatch, useSelector } from "react-redux";
import {
  getItems,
  getAllItems,
  saveItem,
  updateItem,
} from "./../../services/items.service";
import CONSTANTS from "../../../../constants";
import { sendToast } from "../../../../shared/services/notification.service";
import { Helmet } from "react-helmet";
import { useDidUpdateControl } from "../../../../hooks/useDidUpdateControl";
import ItemList from "./ItemList";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilSearch, cilTrash } from "@coreui/icons";

const { ENTER_KEYCODE, TAB_KEYCODE } = CONSTANTS;

const queryParamsInitial = {
  page: 1,
};

function Item() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.items);
  const saveSuccess = useSelector((state) => state.items.saveSuccess);
  const saving = useSelector((state) => state.items.saving);
  const fetching = useSelector((state) => state.items.fetching);
  const [searchTerm, setSearchTerm] = useState("");
  let [editing, setEditing] = useState(false);
  let [copying, setCopying] = useState(false);
  let [item, setItem] = useState(null);
  const [showFilterSection, setShowFilterSection] = useState(false);
  const [queryParams, setQueryParams] = useState(queryParamsInitial);
  const searchInputRef = useRef();

  useEffect(() => {
    setSearchTerm("");
    dispatch(getItems({ page: 1 }));
  }, [dispatch]);

  useDidUpdateControl(
    () => {
      if (saveSuccess) {
        setEditing(false);
        sendToast(dispatch, { message: "Guardado exitosamente!" });
        setItem(null);
        handleSearch({ page: queryParams.page });
      } else {
        sendToast(dispatch, {
          message: "No se pudo guardar los datos",
          color: "danger",
        });
      }
    },
    saving,
    [saveSuccess]
  );

  const handleSave = (item) => {
    delete item.price; // delete after making sure the changes
    delete item.measurementUnit;
    delete item.cost;
    if (item._id) dispatch(updateItem(item));
    else dispatch(saveItem(item));
  };

  const handleCancel = async () => {
    setEditing(false);
  };

  const handlePrevPage = async () => {
    const newParams = {
      ...queryParams,
      page: queryParams.page === 1 ? 1 : queryParams.page - 1,
    };
    search(newParams);
  };

  const handleNextPage = async () => {
    const newParams = { ...queryParams, page: queryParams.page + 1 };
    search(newParams);
  };

  const onChangeField = ({ target: { value } }) => setSearchTerm(value);

  const onKeyDownCodeField = async ({ keyCode }) => {
    if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode))
      handleSearch({ page: 1 });
  };

  const search = async (params = {}) => {
    setQueryParams(params);
    //dispatch(getAllItems());
    dispatch(getItems(params));
  };

  const handleSearch = (params = {}) => {
    const newParams = { ...params };
    if (!!searchTerm) {
      newParams.code = searchTerm.trim();
      newParams.name = searchTerm.trim();
    }
    search(newParams);
  };

  const handleEdit = (item) => {
    setEditing(true);
    setCopying(false);
    setItem(item);
  };

  const handleCopy = (item) => {
    setCopying(true);
    setEditing(true);
    setItem(item);
  };

  const handleNewItem = () => {
    setItem(null);
    setEditing(true);
    setCopying(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    const params = { page: 1 };
    search(params);
    searchInputRef.current.focus();
  };

  const handleFilter = () => {
    setShowFilterSection(!showFilterSection);
  };

  const handleChangeFilters = ({ target: { name, value } }) => {
    const params = { ...queryParams, page: 1, [name]: value };
    search(params);
  };

  return (
    <>
      <CContainer>
        <Helmet>
          <title>ITEMS</title>
        </Helmet>
        <CCard className="shadow border-10">
          <CCardHeader>
            {!editing && (
              <>
                <CRow>
                  <CCol xs="2" lg="3">
                    <CButton
                      variant="outline"
                      color="success"
                      onClick={handleNewItem}
                    >
                      <div className="d-none d-lg-block">NUEVO</div>
                      <div className="d-lg-none">
                        <CIcon icon={cilPlus} size="sm" />
                      </div>
                    </CButton>
                  </CCol>
                  <CCol xs="8" lg="5">
                    <CInputGroup>
                      <CFormInput
                        ref={searchInputRef}
                        type="text"
                        name="searchTerm"
                        placeholder="..."
                        value={searchTerm}
                        onChange={(event) => onChangeField(event)}
                        onKeyDown={(event) => onKeyDownCodeField(event)}
                      />
                      <CButton
                        type="button"
                        variant="outline"
                        color="primary"
                        onClick={() => handleSearch({ page: 1 })}
                      >
                        <div className="d-none d-lg-block">BUSCAR</div>
                        <div className="d-lg-none">
                          <CIcon icon={cilSearch} size="sm" />
                        </div>
                      </CButton>
                      <CButton
                        variant="outline"
                        type="button"
                        color="secondary"
                        onClick={handleClear}
                      >
                        <div className="d-none d-lg-block">BORRAR</div>
                        <div className="d-lg-none">
                          <CIcon icon={cilTrash} size="sm" />
                        </div>
                      </CButton>
                    </CInputGroup>
                  </CCol>
                  <CCol xs="2" lg="1">
                    <CButton color="link" onClick={handleFilter}>
                      Filtrar
                    </CButton>
                  </CCol>
                  {showFilterSection && (
                    <>
                      <CCol xs="2" lg="1" className="text-end">
                        <CFormLabel htmlFor="stock" className="col-form-label">
                          Stock
                        </CFormLabel>
                      </CCol>
                      <CCol xs="4" lg="2">
                        <CFormSelect
                          id="stock"
                          className="my-1"
                          value={queryParams.stock}
                          name="stock"
                          size="sm"
                          options={[
                            { label: "TODOS", value: "" },
                            { label: "DISPONIBLE", value: "IS" },
                            { label: "RECOMPRA", value: "RP" },
                            { label: "NO DISPONIBLE", value: "WS" },
                          ]}
                          onChange={handleChangeFilters}
                        />
                      </CCol>
                    </>
                  )}
                </CRow>
              </>
            )}
            {editing && (
              <div>
                {item ? (copying ? "COPIANDO" : "EDITANDO") : "CREANDO"} ITEM
              </div>
            )}
          </CCardHeader>
          <CCardBody>
            {!editing && (
              <ItemList
                items={items}
                page={queryParams.page}
                fetching={fetching}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}
            {editing && (
              <ItemForm
                copying={copying}
                item={item}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  );
}

export default Item;
