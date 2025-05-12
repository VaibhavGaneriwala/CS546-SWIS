// logController.js
import { auditLogs } from '../config/mongoCollections.js'

export const getAuditLogs = async () => {
  const auditLogsCol = await auditLogs()
  return await auditLogsCol.find({}).toArray()
}

export const getAuditLogsByUser = async (userId) => {
  const auditLogsCol = await auditLogs()
  return await auditLogsCol.find({ userId }).toArray()
}


export const addAuditLog = async (userId, action, details) => {
    const auditLogsCol = await auditLogs()
    const auditLog = {
        userId,
        action,
        details,
        timestamp: new Date()
    }
    await auditLogsCol.insertOne(auditLog)
    return auditLog
}