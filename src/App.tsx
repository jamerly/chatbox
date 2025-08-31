import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import ChatBoxView from './ChatBoxView';
import ChatBoxFloating from './ChatBoxFloating';

const App: React.FC = () => {  
  return (
    <>
      <div style={{ width: '400px', height: '600px',  padding: '10px' }}>
        <ChatBoxView appId='testAppId' />
      </div>

      <ChatBoxFloating appId='testAppId' />
    </>
  );
};


export default App;