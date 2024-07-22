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
	
	if (!wizModelResponse.data || !wizModelResponse.data.image) {
      throw new Error('La respuesta de la API de WizModel no contiene una URL de imagen');
    }
	
    const generatedImageUrl = wizModelResponse.data.image;

    
     // Reescalamos la imagen usando ImageCDN
    const width = 2048;
    const height = 2048;
    const imageCdnUrl = `https://api.imagecdn.app/v1/image/resize?url=${encodeURIComponent(generatedImageUrl)}&width=${width}&height=${height}`;

    // Realiza la solicitud GET para obtener la imagen reescalada
    const imageCdnResponse = await axios.get(imageCdnUrl, { responseType: 'arraybuffer' });


    // Configura el tipo de contenido y responde con la imagen
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(resizedImageResponse.data);
  } catch (error) {
    console.error('Error al generar o reescalar la imagen:', error);
    res.status(500).json({ error: 'Error al generar o reescalar la imagen' });
  }
}