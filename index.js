import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';

import authRoutes      from './server/routes/auth.js';
import companyRoutes   from './server/routes/companies.js';
import distRoutes      from './server/routes/distributors.js';
import agentRoutes     from './server/routes/agents.js';
import productRoutes   from './server/routes/products.js';
import stockRoutes     from './server/routes/stock.js';
import shopRoutes      from './server/routes/shops.js';
import dispatchRoutes  from './server/routes/dispatches.js';
import shopSaleRoutes  from './server/routes/shopsales.js';
import orderRoutes     from './server/routes/orders.js';
import { regR, tarR, proR, audR } from './server/routes/misc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'","'unsafe-inline'","https://cdn.jsdelivr.net","https://fonts.googleapis.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:      ["'self'","'unsafe-inline'","https://fonts.googleapis.com","https://cdn.jsdelivr.net"],
      fontSrc:       ["'self'","https://fonts.gstatic.com","https://cdn.jsdelivr.net"],
      imgSrc:        ["'self'","data:","https:","blob:"],
      connectSrc:    ["'self'", "https://cdn.jsdelivr.net"],
      frameSrc:      ["https://www.google.com","https://maps.google.com"],
    },
  },
}));

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

const limiter     = rateLimit({ windowMs:15*60*1000, max:300, standardHeaders:true, legacyHeaders:false });
const authLimiter = rateLimit({ windowMs:15*60*1000, max:10, message:{ status:'error', message:'Too many login attempts. Try again in 15 minutes.' }});
app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/auth',        authRoutes);
app.use('/api/companies',   companyRoutes);
app.use('/api/distributors',distRoutes);
app.use('/api/agents',      agentRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/stock',       stockRoutes);
app.use('/api/shops',       shopRoutes);
app.use('/api/dispatches',  dispatchRoutes);
app.use('/api/shopsales',   shopSaleRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/regions',     regR);
app.use('/api/targets',     tarR);
app.use('/api/promotions',  proR);
app.use('/api/audit',       audR);

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
}));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api'))
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  else
    res.status(404).json({ status:'error', message:'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status||500).json({
    status:'error',
    message: process.env.NODE_ENV==='production' ? 'Something went wrong.' : err.message,
  });
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\u2705  MongoDB connected');
    app.listen(PORT, () => {
      console.log('\ud83d\ude80  Server running \u2192 http://localhost:' + PORT);
      console.log('   Environment : ' + (process.env.NODE_ENV||'development'));
    });
  })
  .catch(err => {
    console.error('\u274c  MongoDB connection failed:', err.message);
    process.exit(1);
  });

export default app;
