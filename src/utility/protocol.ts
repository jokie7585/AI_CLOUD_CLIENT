export interface protocol{
    event: "upload" | "comfirm" | "complete",
    frameSize: number,
    token: string,
}

export interface upStream{
    filename: string,
    relativePath: string,
    type: "file" | "dir",
    data: Blob
}

export interface comfirmStream{
    shouldReTransform: boolean
}

export interface Socketframe{
    header: protocol,
    body: any
}


