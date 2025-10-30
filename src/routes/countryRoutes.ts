import { Router } from 'express';
import * as CountryController from '../controllers/countryController';

const router = Router();

router.post('/refresh', CountryController.refreshCountriesController);
router.get('/image', CountryController.getSummaryImageController);
router.get('/', CountryController.getAllCountriesController);
router.get('/:name', CountryController.getCountryByNameController);
router.delete('/:name', CountryController.deleteCountryController);

export default router;
