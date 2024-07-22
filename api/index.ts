import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Define el manejador de la función para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
	
	console.error("Entra a la aplicación");

  const { texto } = req.query;
  const apiKeyWizModel = process.env.API_KEY;  // Reemplaza esto con tu clave de API de WizModel

    
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
    const wizModelResponse = await axios.post(wizModelUrl, wizModelPayload, { headers: wizModelHeaders });
	
	console.error("Hace la primera llamada");
	
	console.error(wizModelResponse);
    const generatedImageUrl = wizModelResponse.data.image;

    // Reescalamos la imagen usando ImageCDN
    const imageCdnUrl = 'https://api.imagecdn.app/v1/image/resize';
    const imageCdnPayload = {
      url: generatedImageUrl,
      width: 2048,
      height: 2048,
    };

    const imageCdnResponse = await axios.get(imageCdnUrl, imageCdnPayload);
	
	console.error("Hace la segunda llamada");
	
    const resizedImageUrl = imageCdnResponse.data.url;

    // Solicita la imagen reescalada
    const resizedImageResponse = await axios.get(resizedImageUrl, { responseType: 'arraybuffer' });

    // Configura el tipo de contenido y responde con la imagen
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(resizedImageResponse.data);
  } catch (error) {
    console.error('Error al generar o reescalar la imagen:', error);
    res.status(500).json({ error: 'Error al generar o reescalar la imagen' });
  }
}