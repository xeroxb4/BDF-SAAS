import express   from 'express';
import protect   from '../middleware/auth.js';
import scope     from '../middleware/scopeCompany.js';
import AuditLog  from '../models/AuditLog.js';
import Distributor from '../models/Distributor.js';
import Agent       from '../models/Agent.js';
import Product     from '../models/Product.js';
import Stock       from '../models/Stock.js';
import Dispatch    from '../models/Dispatch.js';
import Shop        from '../models/Shop.js';
import ShopSale    from '../models/ShopSale.js';
import SalesTarget from '../models/SalesTarget.js';
import RoutePlan   from '../models/RoutePlan.js';
import Promotion   from '../models/Promotion.js';
import Region      from '../models/Region.js';

export { Distributor, Agent, Product, Stock, Dispatch, Shop, ShopSale, SalesTarget, RoutePlan, Promotion, Region };

// Shared audit helper
export async function audit(req, action, resource, id, detail) {
  await AuditLog.create({
    companyId: req.scopedCompanyId, user: req.user._id,
    username: req.user.username, action, resource,
    resourceId: String(id), detail, ip: req.ip,
  });
}
