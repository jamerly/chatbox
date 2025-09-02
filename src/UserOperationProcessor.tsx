import React, { useState, useEffect, useCallback } from 'react'

interface UserOperationProcessorProps {
  config: object
  description?: string
  // alreadyCreated?: boolean
  children?: React.ReactNode
}

const UserOperationProcessor : React.FC<UserOperationProcessorProps> = ({ config, description, children }) => {

  return (
    <div>
      <div>
        <button>{config.content}</button>
      </div>
    </div>
  )
}

export default UserOperationProcessor
