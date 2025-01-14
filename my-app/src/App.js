import React from 'react';
//import CardList from './CardList';
//import CardListWithFilter from './CardListWithFilter';
import CardWithDesign from './cardWithDesign';
import TableViewGuestV1 from './tableViewGuestV1';
import { Routes, Route, Navigate } from 'react-router-dom';
import StickyNavbar from './StickyNavbar.js';

function App() {
  return (
    <div>
      <StickyNavbar />
      <Routes>
        <Route path="/" element={<Navigate to="/listView" />} />
        <Route path="/cardView" element={ <CardWithDesign />} />
        <Route path="/listView" element={<TableViewGuestV1 />} />
      </Routes>
    </div>
  );
}

export default App;