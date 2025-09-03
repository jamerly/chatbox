import React, { useState, useEffect, useCallback } from 'react'

interface ConfigProps {
  content: string,
  name:string
  params:any
}

interface UserOperationProcessorProps {
  config: ConfigProps
  description?: string
  // alreadyCreated?: boolean
  children?: React.ReactNode
  onUserAction?:((e: any ) => void) | undefined;
}

const UserOperationProcessor : React.FC<UserOperationProcessorProps> = ({ config, description, children,onUserAction }) => {
  if( onUserAction ){
    setTimeout(()=>{
      onUserAction(config)
    },200);
  }
  return (
    <div>
      <div>
        <button>Executing {config.name}</button>
      </div>
    </div>
  )
}

export default UserOperationProcessor
