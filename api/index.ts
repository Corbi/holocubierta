import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Función para extraer el MIME type del base64
function extractMimeType(base64String: string): string {
  const mimeTypeMatch = base64String.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return mimeTypeMatch ? mimeTypeMatch[1] : '';
}

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

  let attempts = 0;
  const maxAttempts = 5;
  let success = false;
  let imageBuffer: Buffer | null = null;
  let mimeType: string = '';

  while (attempts < maxAttempts && !success) {
    try {
      const wizModelResponse = await axios.post(wizModelUrl, wizModelPayload, {
        headers: wizModelHeaders,
        timeout: 30000, // Establecer un tiempo de espera de 30 segundos
      });

      if (!wizModelResponse.data || !wizModelResponse.data.images || !wizModelResponse.data.images.length) {
        throw new Error('La respuesta de la API de WizModel no contiene imágenes');
      }

      const base64Image = wizModelResponse.data.images[0];
      mimeType = extractMimeType(base64Image);

      if (mimeType === 'image/jpeg') {
        // Asegúrate de que la cadena base64 no contiene encabezados como "data:image/jpeg;base64,"
        const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, '');

        // Decodifica la imagen base64
        imageBuffer = Buffer.from(base64Data, 'base64');
        success = true;
      } else {
        console.error(`Intento ${attempts + 1}: Mimetype no es JPEG, es ${mimeType}. Reintentando...`);
      }
    } catch (error) {
      console.error(`Intento ${attempts + 1} fallido: ${error.message || error}`);
    }

    attempts++;
  }

  if (success && imageBuffer) {
    // Configura el encabezado de tipo de contenido como image/jpeg
    res.setHeader('Content-Type', 'image/jpeg');
    // Envía el buffer de la imagen como respuesta
    res.send(imageBuffer);
  } else {
    // Maneja el caso en que no se haya logrado obtener una imagen JPEG después de varios intentos
    res.status(500).json({ error: 'No se pudo obtener una imagen JPEG después de varios intentos' });
  }
}
