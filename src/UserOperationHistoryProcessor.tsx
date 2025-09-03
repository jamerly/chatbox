import React, { useState, useEffect, useCallback } from 'react'

interface ConfigProps {
  content: string,
  name:string
  params:any
}

interface UserOperationHistoryProcessorProps {
  config: ConfigProps
  description?: string
  // alreadyCreated?: boolean
  children?: React.ReactNode
}

const UserOperationHistoryProcessor : React.FC<UserOperationHistoryProcessorProps> = ({ config, description, children }) => {
  return (
    <div>
      <div>
        <button disabled>Executed {config.name}</button>
      </div>
    </div>
  )
}

export default UserOperationHistoryProcessor
