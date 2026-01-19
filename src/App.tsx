import React, { useState } from 'react';
import './App.css';

import ChatBoxView from './ChatBoxView';
import ChatBoxFloating from './ChatBoxFloating';

const App: React.FC = () => {
  const [mode, setMode] = useState<'chat' | 'floating'>('chat');

  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'chat' ? 'floating' : 'chat'));
  };

  return (
    <>
      <h1>ChatBox Demo</h1>
      <button onClick={toggleMode}>
        Switch to {mode === 'chat' ? 'Floating' : 'Chat'} Mode
      </button>

      {mode === 'chat' ? (
        <div style={{ width: '400px', height: '600px', padding: '10px' }}>
          <ChatBoxView appId='8a0fbbde1a5043b3b33e54505decbeb9281c29fc11bf46a4be18a42179d55bfc' onUserAction={(e) => {
            console.log(e);
          }} />
        </div>
      ) : (
        <>
          <ChatBoxFloating appId='8a0fbbde1a5043b3b33e54505decbeb9281c29fc11bf46a4be18a42179d55bfc' />
        </>
      )}
    </>
  );
};

export default App;
