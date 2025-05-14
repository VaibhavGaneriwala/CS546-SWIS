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


export const addAuditLog = async (productId, userId, name, action, details) => {
    const auditLogsCol = await auditLogs()

    userId = new ObjectId(userId)
    
    const auditLog = {
        productId,
        userId,
        userName: name,
        action,
        details,
        timestamp: new Date()
    }
    await auditLogsCol.insertOne(auditLog)
    return auditLog
}