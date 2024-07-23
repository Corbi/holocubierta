import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Define el manejador de la función para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
	
	

  const { texto } = req.query;
  const apiKeyWizModel = process.env.API_KEY;  // Reemplaza esto con tu clave de API de WizModel

	console.error(`${texto}`);
    
  // Verifica si el parámetro texto está definido
  if (!texto || typeof texto !== 'string') {
    return res.status(400).json({ error: 'Parámetro "texto" es requerido' });
  }

  const wizModelUrl = 'https://api.wizmodel.com/sdapi/v1/txt2img';
  const prompt = `${texto}, skybox, 360`;

  const wizModelPayload = {
    prompt: prompt,
    steps: 30,
  };

  const wizModelHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKeyWizModel}`,
};

  try {
	const wizModelResponse = await axios.post(wizModelUrl, wizModelPayload, { 
      headers: wizModelHeaders,
      timeout: 30000 // Establecer un tiempo de espera de 10 segundos
    });

    if (!wizModelResponse.data || !wizModelResponse.data.images || !wizModelResponse.data.images.length) {
      throw new Error('La respuesta de la API de WizModel no contiene imágenes');
    }

    const base64Image = wizModelResponse.data.images[0];
	
	console.error(base64Image);

    // Asegúrate de que la cadena base64 no contiene encabezados como "data:image/png;base64,"
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');

    // Decodifica la imagen base64
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Configura el encabezado de tipo de contenido como image/png
    res.setHeader('Content-Type', 'image/jpeg');
    
    // Envía el buffer de la imagen como respuesta
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error al generarla imagen:', error.message || error);
    res.status(500).json({ error: 'Error al generarla imagen' });
  }
}