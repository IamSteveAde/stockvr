import { Response } from "express";

export const notFound = (res: Response, message: string) => {
    return res.status(404).json({ "message": message, status: "error" })
}

export const notAcceptable = (res: Response, message: string) => {
    return res.status(406).json({ message, status: "error" })
}

export const generalError = (res: Response, message: string, data?: Record<any, any>) => {
    return res.status(400).json({ "message": message, status: "error", data: data })
}

export const success = (res: Response, data: Record<any, any>, message?: string) => {

    return res.status(200).json({ status: "success", data, "message": message ?? "" })
}

export const created = (res: Response, message: string) => {
    return res.status(201).json({ status: "success", "message": message ?? "" })
}

export const unAuthorized = (res: Response, message: string) => {
    return res.status(401).json({ "message": message, status: "error" })
}

export const expired = (res: Response, message: string) => {
    return res.status(403).json({ "message": message, status: "error" })
}

export const invalid = (res: Response, message: string) => {
    return res.status(498).json({ "message": message, status: "error" })
}

export const newError = (res: Response, message: string, statusC: number) => {
    return res.status(statusC).json({ "message": message, status: "error" })
}

export const exists = (res: Response, message: string) => {
    return res.status(409).json({ "message": message, status: "error" })
}

export const internalServerError = (res: Response, message: string) => {
    return res.status(500).json({ "message": message, status: "error" })
}

export const notModifiedError = (res: Response) => {
    return res.status(304).json({ "message": "Not modified", status: "error" })
}

export const redirect = (res: Response, url: string) => {
    return res.status(301).redirect(url)
}

