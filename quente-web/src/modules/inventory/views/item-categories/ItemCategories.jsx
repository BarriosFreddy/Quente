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
} from "@coreui/react";
import ItemCategoriesForm from "./ItemCategoriesForm";
import { useDispatch, useSelector } from "react-redux";
import { getItemCategories } from "../../services/item-categories.service";
import CONSTANTS from "../../../../constants";
import { Helmet } from "react-helmet";
import { sendToast } from "../../../../shared/services/notification.service";
import {
  saveItemCategory,
  updateItemCategory,
} from "../../services/item-categories.service";
import ItemCategoriesList from "./ItemCategoriesList";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilSearch, cilTrash } from "@coreui/icons";
import { useDidUpdateControl } from "@/hooks/useDidUpdateControl";

const { ENTER_KEYCODE, TAB_KEYCODE } = CONSTANTS;

function Categories() {
  const dispatch = useDispatch();
  const itemCategories = useSelector(
    (state) => state.itemCategories.itemCategories
  );
  const saving = useSelector((state) => state.itemCategories.saving);
  const fetching = useSelector((state) => state.itemCategories.fetching);
  const saveSuccess = useSelector((state) => state.itemCategories.saveSuccess);
  const [searchTerm, setSearchTerm] = useState("");
  let [itemCategory, setItemCategory] = useState(null);
  let [editing, setEditing] = useState(false);
  let [page, setPage] = useState(1);
  const searchInputRef = useRef();

  useEffect(() => {
    setSearchTerm("");
    dispatch(getItemCategories({ page: 1 }));
  }, [dispatch]);

  useDidUpdateControl(() => {
    if (saveSuccess) {
      setSearchTerm("");
      dispatch(getItemCategories({ page }));
      setEditing(false);
      setItemCategory(null);
      sendToast(dispatch, { message: "Guardado exitosamente!" });
    } else
      sendToast(dispatch, {
        message: "No se pudo guardar los datos",
        color: "danger",
      });
  }, saving);

  const handleSave = (itemCategory) => {
    if (itemCategory._id) dispatch(updateItemCategory(itemCategory));
    else dispatch(saveItemCategory(itemCategory));
  };

  const handleEdit = (itemCategory) => {
    setEditing(true);
    setItemCategory(itemCategory);
  };

  const handleCancel = async () => {
    dispatch(getItemCategories({ page }));
    setEditing(false);
  };

  const handleNextPage = async () => {
    const newPage = page + 1;
    setPage(newPage);
    dispatch(getItemCategories({ page: newPage }));
  };

  const handlePrevPage = async () => {
    const newPage = page === 1 ? 1 : page - 1;
    setPage(newPage);
    dispatch(getItemCategories({ page: newPage }));
  };

  const onChangeField = ({ target: { value } }) => {
    setSearchTerm(value);
  };

  const onKeyDownCodeField = async ({ keyCode }) => {
    if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode)) search();
  };

  const search = async () => {
    if (!!searchTerm) {
      dispatch(
        getItemCategories({
          code: searchTerm.trim(),
          name: searchTerm.trim(),
          page: 1,
        })
      );
      return;
    }
    dispatch(getItemCategories({ page: 1 }));
  };

  const handleNew = () => {
    setEditing(true);
    setItemCategory(null);
  };

  const handleClear = () => {
    setSearchTerm("");
    dispatch(getItemCategories({ page: 1 }));
    searchInputRef.current.focus();
  };

  return (
    <>
      <CContainer className="mt-6">
        <Helmet>
          <title>CATEGORIA DE ITEMS</title>
        </Helmet>
        <CCard className="mt-6 shadow border-10">
          <CCardHeader>
            {!editing && (
              <CRow>
                <CCol xs="2" lg="3">
                  <CButton
                    variant="outline"
                    color="success"
                    onClick={handleNew}
                  >
                    <div className="d-none d-lg-block">NUEVA</div>
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
                      onClick={search}
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
              </CRow>
            )}
            {editing && (
              <div className="d-none d-lg-block">
                {itemCategory ? "EDITANDO" : "CREANDO"} CATEGORIA
              </div>
            )}
          </CCardHeader>
          <CCardBody>
            {!editing && (
              <ItemCategoriesList
                itemCategories={itemCategories}
                page={page}
                fetching={fetching}
                onEdit={handleEdit}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}
            {editing && (
              <ItemCategoriesForm
                itemCategory={itemCategory}
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

export default Categories;
