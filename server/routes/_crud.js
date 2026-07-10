import AuditLog from '../models/AuditLog.js';

export async function audit(req, action, resource, id, detail){
  await AuditLog.create({companyId:req.scopedCompanyId, user:req.user._id, username:req.user.username, action, resource, resourceId:String(id), detail, ip:req.ip});
}
