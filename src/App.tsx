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
          <ChatBoxView appId='e3364f1399274de68cdc4a22c88e92f13bca9bf6f0344662baea1199c6b29db3' onUserAction={(e)=>{
            // console.log(e);
          }} />
        </div>
      ) : (
        <>
        <ChatBoxFloating appId='0dd746d300e74782aecceb88767208510d03b20c8b17488480dc9dec313d383a1' />
        </>
      )}
    </>
  );
};

export default App;
