import { Router } from 'express';
import { AIController } from '../controllers';

const router = Router();

router.post('/vibe-match', AIController.matchVibe);

export default router;
