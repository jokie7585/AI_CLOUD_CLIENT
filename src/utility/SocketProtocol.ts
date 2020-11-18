export interface socketRequest {

}

export interface socketReponse {
    action: 'authorize' | 'disAuthorize' | 'update' | 'message',
    body: forceUpdate | String
}

export interface socketHeader {
}



export interface forceUpdate {
    target: 'batchComponent' | 'nofification'
}