// logController.js
import { auditLogs } from '../config/mongoCollections.js'
import { ObjectId } from 'mongodb'

export const getAuditLogs = async () => {
  const auditLogsCol = await auditLogs()
  return await auditLogsCol.find({}).toArray()
}

export const getAuditLogsByUser = async (userId) => {
  const auditLogsCol = await auditLogs()
  return await auditLogsCol.find({ userId }).toArray()
}


export const addAuditLog = async (userId, name, action, details) => {
    const auditLogsCol = await auditLogs()
    const auditLog = {
        userId,
        userName: name,
        action,
        details,
        timestamp: new Date()
    }
    await auditLogsCol.insertOne(auditLog)
    return auditLog
}