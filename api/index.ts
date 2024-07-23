import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Define el manejador de la función para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {

  console.error("Entra a la aplicación");

  const { texto } = req.query;
  const apiKeyWizModel = process.env.API_KEY;  // Reemplaza esto con tu clave de API de WizModel

  console.error("apiKeyWizModel");

  // Verifica si el parámetro texto está definido
  if (!texto || typeof texto !== 'string') {
    return res.status(400).json({ error: 'Parámetro "texto" es requerido' });
  }

  const wizModelUrl = 'https://api.wizmodel.com/sdapi/v1/txt2img';
  const prompt = `${texto}, skybox`;

  const wizModelPayload = {
    prompt: prompt,
    steps: 100,
  };

  const wizModelHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKeyWizModel}`,
  };

  try {
    const wizModelResponse = await axios.post(wizModelUrl, wizModelPayload, { headers: wizModelHeaders });

    // Devuelve la respuesta completa de la API
    res.status(200).json(wizModelResponse.data);
  } catch (error) {
    console.error('Error al generar o reescalar la imagen:', error.message || error);
    res.status(500).json({ error: 'Error al generar o reescalar la imagen' });
  }
}