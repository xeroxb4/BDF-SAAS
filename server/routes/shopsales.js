
import express from 'express';
import ShopSale from '../models/ShopSale.js';
import Shop from '../models/Shop.js';
import protect from '../middleware/auth.js';
import scope from '../middleware/scopeCompany.js';



const router = express.Router();
router.use(protect, scope);


// router.get('/', async (req, res) => {
//   try {
//     const f={};
//     if(req.scopedCompanyId) f.companyId=req.scopedCompanyId;
//     if(req.query.shopId) f.shopId=req.query.shopId;
//     if(req.query.agentId) f.agentId=req.query.agentId;
//     if(req.query.date) f.date=req.query.date;
//     const sales=await ShopSale.find(f).populate('shopId','name locationName ownerName ownerContact address').populate('productId','name cat price').populate('agentId','name role').populate('distributorId','name').sort({createdAt:-1});
//     res.json({status:'success', data:sales});
//   } catch(e){ res.status(500).json({status:'error', message:e.message}); }
// });

// router.post('/', async (req, res) => {
//   try {
//     const {shopId, paymentMethod, qty, price}=req.body;
//     const isPaid=paymentMethod!=='credit';
//     const sale=await ShopSale.create({...req.body, companyId:req.scopedCompanyId, isPaid, paidAt:isPaid?new Date():undefined, createdBy:req.user._id});
//     if(!isPaid && shopId) await Shop.findByIdAndUpdate(shopId, {$inc:{creditBalance:qty*price}});
//     const populated=await ShopSale.findById(sale._id).populate('shopId','name locationName ownerName ownerContact address').populate('productId','name cat price').populate('agentId','name role').populate('distributorId','name');
//     res.status(201).json({status:'success', data:populated});
//   } catch(e){ res.status(400).json({status:'error', message:e.message}); }
// });

// router.patch('/:id/pay', async (req, res) => {
//   try {
//     const sale=await ShopSale.findOne({_id:req.params.id, companyId:req.scopedCompanyId});
//     if(!sale) return res.status(404).json({status:'error', message:'Sale not found.'});
//     if(sale.isPaid) return res.status(400).json({status:'error', message:'Already paid.'});
//     sale.isPaid=true; sale.paidAt=new Date(); sale.paymentMethod=req.body.paymentMethod||'cash';
//     await sale.save();
//     await Shop.findByIdAndUpdate(sale.shopId, {$inc:{creditBalance:-(sale.qty*sale.price)}});
//     res.json({status:'success', data:sale});
//   } catch(e){ res.status(400).json({status:'error', message:e.message}); }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     const sale = await ShopSale.findOneAndDelete({
//       _id:req.params.id,
//       companyId:req.scopedCompanyId
//     });

//     if(!sale) {
//       return res.status(404).json({
//         status:'error',
//         message:'Not found.'
//       });
//     }

//     if(!sale.isPaid) {
//       await Shop.findByIdAndUpdate(
//         sale.shopId,
//         {
//           $inc:{
//             creditBalance:-(sale.qty * sale.price)
//           }
//         }
//       );
//     }

//     res.json({
//       status:'success',
//       message:'Deleted.'
//     });

//   } catch(e) {
//     res.status(400).json({
//       status:'error',
//       message:e.message
//     });
//   }
// });

// Generate receipt number: RCT-YYYYMMDD-XXXX
function genReceiptNo() {
  const d   = new Date();
  const date = d.getFullYear().toString() +
    String(d.getMonth()+1).padStart(2,'0') +
    String(d.getDate()).padStart(2,'0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RCT-${date}-${rand}`;
}

// GET /api/shopsales?shopId=&agentId=&date=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.scopedCompanyId)  filter.companyId = req.scopedCompanyId;
    if (req.query.shopId)     filter.shopId    = req.query.shopId;
    if (req.query.agentId)    filter.agentId   = req.query.agentId;
    if (req.query.date)       filter.date      = req.query.date;
    const sales = await ShopSale.find(filter)
      .populate('shopId','name locationName ownerName ownerContact address')
      .populate('productId','name cat price')
      .populate('agentId','name role')
      .populate('distributorId','name')
      .sort({ createdAt: -1 });
    res.json({ status:'success', data: sales });
  } catch(e) { res.status(500).json({ status:'error', message: e.message }); }
});

// POST /api/shopsales
router.post('/', async (req, res) => {
  try {
    const { shopId, paymentMethod, qty, price } = req.body;
    const isPaid = paymentMethod !== 'credit';
    const sale   = await ShopSale.create({
      ...req.body,
      companyId:  req.scopedCompanyId,
      isPaid,
      paidAt:     isPaid ? new Date() : undefined,
      receiptNo:  genReceiptNo(),
      createdBy:  req.user._id,
    });

    // If credit — increase shop's credit balance
    if (!isPaid && shopId) {
      await Shop.findByIdAndUpdate(shopId, { $inc: { creditBalance: qty * price } });
    }

    const populated = await ShopSale.findById(sale._id)
      .populate('shopId','name locationName ownerName ownerContact address')
      .populate('productId','name cat price')
      .populate('agentId','name role')
      .populate('distributorId','name');

    res.status(201).json({ status:'success', data: populated });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }
});

// PATCH /api/shopsales/:id/pay — mark credit sale as paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const sale = await ShopSale.findOne({ _id: req.params.id, companyId: req.scopedCompanyId });
    if (!sale) return res.status(404).json({ status:'error', message:'Sale not found.' });
    if (sale.isPaid) return res.status(400).json({ status:'error', message:'Already paid.' });

    sale.isPaid          = true;
    sale.paidAt          = new Date();
    sale.paymentMethod   = req.body.paymentMethod || 'cash';
    await sale.save();

    // Reduce shop credit balance
    await Shop.findByIdAndUpdate(sale.shopId, {
      $inc: { creditBalance: -(sale.qty * sale.price) }
    });

    res.json({ status:'success', data: sale });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }
});

// DELETE /api/shopsales/:id
router.delete('/:id', async (req, res) => {
  try {
    const sale = await ShopSale.findOneAndDelete({ _id: req.params.id, companyId: req.scopedCompanyId });
    if (!sale) return res.status(404).json({ status:'error', message:'Sale not found.' });
    // Reverse credit if unpaid
    if (!sale.isPaid) {
      await Shop.findByIdAndUpdate(sale.shopId, { $inc: { creditBalance: -(sale.qty * sale.price) } });
    }
    res.json({ status:'success', message:'Sale deleted.' });
  } catch(e) { res.status(400).json({ status:'error', message: e.message }); }

});

export default router;
