// server/utils/faissSearch.js
import { PythonShell } from 'python-shell';
import path from 'path';
import fs from 'fs';

/**
 * Searches the FAISS index using a query and returns top-k matching text chunks.
 * @param {string} query - The user's query.
 * @param {number} topK - Number of top results to retrieve.
 * @returns {Promise<string[]>} Array of matching text chunks.
 */
export async function searchFaissIndex(query, topK = 3) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join('server', 'utils', 'queryVector.py');

    PythonShell.run(scriptPath, {
      args: [query, topK.toString()]
    }, (err, results) => {
      if (err) {
        console.error("❌ Error running FAISS search:", err);
        return reject(err);
      }

      // Results is an array of strings (one per line printed in Python script)
      if (results && results.length > 0) {
        resolve(results);
      } else {
        resolve([]);
      }
    });
  });
}
