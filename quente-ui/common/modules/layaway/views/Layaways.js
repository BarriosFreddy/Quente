import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import {
  CContainer,
} from '@coreui/react';
import {
  getLayaways,
  getLayawayById,
  getLayawayPayments,
  saveLayaway,
} from '../services/layaways.service';
import LayawayForm from "./LayawayForm";
import LayawayDetail from "./LayawayDetail";
import LayawayList from './LayawayList';

const VIEW_STATES = {
  LIST: 'list',
  NEW: 'new',
  EDIT: 'edit',
  DETAIL: 'detail'
};

function Layaways() {
  const dispatch = useDispatch();
  const layaway = useSelector((state) => state.layaways.layaway);

  const [currentView, setCurrentView] = useState(VIEW_STATES.LIST);
  const [selectedLayawayId, setSelectedLayawayId] = useState(null);

  useEffect(() => {
    dispatch(getLayaways({ page: 1 }));
  }, [dispatch]);

  const handleSearch = async (params = {}) => {
    dispatch(getLayaways(params));
  };

  const viewLayaway = (id) => {
    setSelectedLayawayId(id);
    setCurrentView(VIEW_STATES.DETAIL);
    dispatch(getLayawayById(id));
    dispatch(getLayawayPayments(id));
  };

  const handleNewLayaway = () => {
    setCurrentView(VIEW_STATES.NEW);
  };
  const handleEditLayaway = (id) => {
    setSelectedLayawayId(id);
    setCurrentView(VIEW_STATES.EDIT);
    dispatch(getLayawayById(id));
  };

  const handleBackToList = () => {
    setCurrentView(VIEW_STATES.LIST);
    setSelectedLayawayId(null);
    dispatch(getLayaways({ page: 1 }));
  };

  const handleSaveLayaway = (layaway) => {
    dispatch(saveLayaway(layaway)).then((response) => {
      if (response) {
        handleBackToList();
      }
    });
  };

  return (
    <>
      <CContainer>
        <Helmet>
          <title>PLANES SEPARE</title>
        </Helmet>
        {currentView === VIEW_STATES.LIST && (
          <LayawayList
            onNew={handleNewLayaway}
            onSelect={viewLayaway}
            onEdit={handleEditLayaway}
            onSearch={handleSearch}
          />
        )}
        {(currentView === VIEW_STATES.NEW || currentView === VIEW_STATES.EDIT) && (
          <LayawayForm
            layaway={currentView === VIEW_STATES.EDIT ? layaway : null}
            onCancel={handleBackToList}
            onSave={handleSaveLayaway}
          />
        )}

        {currentView === VIEW_STATES.DETAIL && layaway && (
          <LayawayDetail onBack={handleBackToList} />
        )}
      </CContainer>
    </>

  );
}

export default Layaways;
