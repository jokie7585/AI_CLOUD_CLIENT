import {v1 as uuidGenerater} from 'uuid'
export const maxmsgSize = 10 * Math.pow(2, 20); // byte

export interface protocol{
    event: "upload" | "comfirm" | "complete",
    userId: string,
    token: string,
}

export function createProtocol(event: "upload" | "comfirm" | "complete", userId: string,token?: string,):protocol{
    return{
        event: event,
        userId: userId,
        token: token || ''
    }
}

export interface upStream{
    uuid: string,
    finished: boolean,
    filename: string,
    relativePath: string,
    type: "file" | "dir",
    data: ArrayBuffer
}

export function createUpStream(
    uuid: string,
    finished: boolean,
    filename: string,
    relativePath: string,
    type: "file" | "dir",
    data: ArrayBuffer): upStream{
        return {
            uuid: uuid,
            finished: finished,
            filename: filename,
            relativePath: relativePath,
            type: type,
            data:data
        }
}

export interface uploadProcess{
    proccessId: number,
    uuid:string,
    fragmentCouter: number,
    filename: string,
    totolefragment:number,
    fragment: Array<Blob>,
    finished: boolean,
    relativePath: string,
    type: "file" | "dir",

}

export function createProcess(file:File, relativePath): uploadProcess{
    let newprocess: uploadProcess = {} as uploadProcess;
    // code here
    // count num of fragement
    let totolFragement: number = Math.floor(file.size / maxmsgSize) + 1;
    // prepare fragment
    let FragementArr: Array<Blob> = [];
    for(let i = 0; i < totolFragement - 1; i++){
        FragementArr.push(file.slice(i*maxmsgSize, i*maxmsgSize+maxmsgSize))
    }
    FragementArr.push(file.slice((totolFragement-1)*maxmsgSize, file.size))
    // code end
    // bound data
    newprocess.uuid = uuidGenerater();
    newprocess.finished = false;
    newprocess.filename = file.name;
    newprocess.fragment = FragementArr;
    newprocess.type = 'file';
    newprocess.relativePath = relativePath;
    newprocess.fragmentCouter = 0;
    newprocess.totolefragment = totolFragement;
    return newprocess;
}


export interface comfirmStream{
    uuid: string,
    shouldReTransform: boolean,
}

export function createComfirmStream(uuid: string, shouldReTransform: boolean,): comfirmStream {
    return {
        uuid: uuid,
        shouldReTransform: shouldReTransform
    }
}



export interface SocketSolideframe{
    header: protocol,
    body: upStream | comfirmStream
}

export function createFrame(header:protocol, body: upStream | comfirmStream): SocketSolideframe {
    return {
        header: header,
        body:body
    }
}

export interface client{
    uuid: string;
    token: string;
    oring: string;
    ws: WebSocket;
}

export function CreateClient(ws: WebSocket, token?: string, oring?: string) :client{
    return {
        ws: ws,
        uuid: uuidGenerater(),
        token: token || '',
        oring: oring || ''
    }
}


