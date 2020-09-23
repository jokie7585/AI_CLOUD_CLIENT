export const CytusAppStatus = {
    WAIT : 'waiting',
    PENDING : 'pending',
    RUNNING : 'running',
    COMPLETE : 'completed',
    Terminate: 'terminate',
    // undefined is used when client first generate branch Record(But not push to Server)
    UNDEFINED : 'undefined',
}

export const CytusBatchStatus = {
    WAIT: 'waiting',
    RUNNING : 'running',
    Terminate: 'terminate',
    COMPLETE : 'completed',
    // undefined is used when client first generate branch Record(But not push to Server)
    UNDEFINED : 'undefined',
}