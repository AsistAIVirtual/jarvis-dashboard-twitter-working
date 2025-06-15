
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const filePath = path.join(process.cwd(), 'src', 'data', 'greenLockData.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const updatedData = data.map(token => {
      const current = token.baseUnlock || 0;
      return { ...token, baseUnlock: Math.max(current - 1, 0) };
    });
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    res.status(200).json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
}
