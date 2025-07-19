import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";

import "./itemSearchComponent.css";
import { useDispatch, useSelector } from "react-redux";
import {
  CButton,
  CCol,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from "@coreui/react";

import { getItems } from "./../../../modules/inventory/services/items.service";

const ItemSearchComponent = forwardRef(function ItemSearchComponent(
  props,
  ref
) {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.items);
  const [itemSelected, setItemSelected] = useState(null);
  const searchInputRef = useRef();
  const componentRef = useRef();
  const [showList, setShowList] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (props.defaultValue) {
      dispatch(getItems({ code: props.defaultValue }));
    }
  }, [dispatch, props.defaultValue]);

  useEffect(() => {
    if (props.defaultItem) {
      setItemSelected(props.defaultItem);
    }
  }, [props.defaultItem]);

  useEffect(() => {
    // Function to handle clicks outside the component
    function handleClickOutside(event) {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setShowList(false);
      }
    }

    // Add event listener when the list is shown
    if (showList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showList]);

  useImperativeHandle(
    ref,
    () => {
      return {
        getSelected() {
          return itemSelected;
        },
        setSelected(item) {
          setItemSelected(item);
        },
        clear() {
          setItemSelected(null);
          setSearchTerm("");
        },
      };
    },
    [itemSelected]
  );

  const handleChangeInput = ({ target: { value } }) => {
    setSearchTerm(value);
    if (value) {
      // Search by both name and code
      dispatch(getItems({ name: value, code: value }));
    }
  };

  const handleClickInput = () => {
    setShowList(true);
  };

  const handleFocusInput = handleClickInput;

  const handleClickRow = (item) => {
    setIsSearching(false);
    setShowList(false);
    setItemSelected(item);
    props.onSelect && props.onSelect(item);
  };

  const handleClickLabel = () => {
    setIsSearching(true);
    setImmediate(() => {
      searchInputRef.current?.focus();
    });
    dispatch(getItems({ name: searchTerm, code: searchTerm }));
  };

  const handleFocusLabel = handleClickLabel;

  const getItemNameFormatted = (item) => item ? `${item?.name || ""} (${item?.code || ""})` : '';



  return (
    <>
      <CRow ref={componentRef}>
        <CFormLabel htmlFor="searchInput" className="col-sm-2 col-form-label d-none d-md-block">
          {props.label || "Artículo:"}
        </CFormLabel>
        <CCol>
          <CInputGroup>
            {isSearching && (
              <CFormInput
                id="searchInput"
                ref={searchInputRef}
                type="text"
                formNoValidate
                size="sm"
                value={searchTerm}
                placeholder="Buscar artículo..."
                onChange={(event) => handleChangeInput(event)}
                onClick={handleClickInput}
                onFocus={handleFocusInput}
                onBlur={() => props.allowBlur && setIsSearching(false)}
              />
            )}
            {!isSearching && (
              <CFormInput
                type="text"
                formNoValidate
                size="sm"
                value={getItemNameFormatted(itemSelected)}
                readOnly
                placeholder={props.placeholder || "Seleccione un artículo..."}
                onClick={handleClickLabel}
                onFocus={handleFocusLabel}
              />
            )}
          </CInputGroup>
          {showList && items && items.length > 0 && (
            <div
              className="item-list"
              style={{
                maxHeight: 150,
                width: searchInputRef.current?.offsetWidth || 200,
              }}
            >
              <CTable
                hover
                small
                borderless
                style={{
                  marginBottom: 0,
                }}
              >
                <CTableBody>
                  {items.map((item, index) => (
                    <CTableRow
                      key={index}
                      active={
                        itemSelected && itemSelected.code === item.code
                      }
                      onClick={() => handleClickRow(item)}
                    >
                      <CTableDataCell>
                        <div>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                          {item.code} - Stock: {item.stock || 0}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
          {showList && (!items || items.length === 0) && searchTerm && (
            <div
              className="item-list"
              style={{
                maxHeight: 150,
                width: searchInputRef.current?.offsetWidth || 200,
                padding: '10px',
                textAlign: 'center'
              }}
            >
              No se encontraron resultados
            </div>
          )}
        </CCol>

      </CRow>

    </>
  );
});

export default ItemSearchComponent;

ItemSearchComponent.propTypes = {
  onSelect: PropTypes.func,
  defaultValue: PropTypes.string,
  defaultItem: PropTypes.object,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  allowBlur: PropTypes.bool
};
