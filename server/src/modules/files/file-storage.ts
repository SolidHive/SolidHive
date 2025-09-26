import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import * as fs from 'fs';

export const storage = diskStorage({
  destination(req, file, cb) {
    const user = req.user;
    if (!user) {
      return cb(new Error('User not found in request'), '');
    }
    const userId = user['id'] as string | undefined;
    if (!userId) {
      return cb(new Error('User ID not found in request'), '');
    }
    const path = `./uploads/${userId}`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename(req, file, cb) {
    const user = req.user;
    if (!user) {
      return cb(new Error('User not found in request'), '');
    }
    const userId = user['id'] as string | undefined;
    if (!userId) {
      return cb(new Error('User ID not found in request'), '');
    }
    cb(null, uuidv4());
  },
});
