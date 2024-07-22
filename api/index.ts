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
  console.error("Entra al try");
    // Solicita la generación de la imagen
    const wizModelResponse = await axios.post(wizModelUrl, wizModelPayload, { 
      headers: wizModelHeaders, 
      timeout: 60000 // 60 segundos
    });
	
	console.error("Hace la primera llamada");
	
	console.error(wizModelResponse);
	
	if (!wizModelResponse.data || !wizModelResponse.data.images || !wizModelResponse.data.images.length) {
      throw new Error('La respuesta de la API de WizModel no contiene imágenes');
    }
	
    // Extrae la imagen codificada en base64
    const base64Image = wizModelResponse.data.images[0];
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Aquí vamos a escribir el archivo en el sistema de archivos temporal y luego responder con la URL del archivo
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join('/tmp', 'generated_image.png');
    fs.writeFileSync(filePath, imageBuffer);

    // Responde con la ruta del archivo temporal
    res.status(200).json({ imageUrl: filePath });
  } catch (error) {
    console.error('Error al generar o reescalar la imagen:', error.message || error);
    res.status(500).json({ error: 'Error al generar o reescalar la imagen' });
  }
}