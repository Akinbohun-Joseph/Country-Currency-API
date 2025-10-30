import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import countryRoutes from './routes/countryRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

const port: number = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
      query: req.query,
      params: req.params,
      body: req.body
    });
    next();
  });
}

app.get('/', (req, res) => {
  res.json({
    message: 'Country Currency API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      refresh: 'POST /countries/refresh',
      getAll: 'GET /countries',
      getOne: 'GET /countries/:name',
      delete: 'DELETE /countries/:name',
      image: 'GET /countries/image',
      status: 'GET /status'
    }
  });
});

app.use('/countries', countryRoutes);

app.get('/status', (req, res, next) => {
  import('./controllers/countryController')
    .then(controller => controller.getStatusController(req, res, next))
    .catch(next);
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    app.listen(port, "0.0.0.0", function () {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║     Country Currency API Server Started 🚀            ║
╠═══════════════════════════════════════════════════════╣
║  Environment: ${NODE_ENV.padEnd(40)}║
║  Port:        ${port.toString().padEnd(40)}║
║  URL:         http://localhost:${port.toString().padEnd(28)}║
╠═══════════════════════════════════════════════════════╣
║  Endpoints:                                           ║
║    POST   /countries/refresh                          ║
║    GET    /countries                                  ║
║    GET    /countries/:name                            ║
║    DELETE /countries/:name                            ║
║    GET    /countries/image                            ║
║    GET    /status                                     ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default app;