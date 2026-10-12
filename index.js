import express from 'express';
import app from './proxy-server.mjs';

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
