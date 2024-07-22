const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/generar/:texto', async (req, res) => {
    const { texto } = req.params;
    const apiKeyWizModel = process.env.API_KEY;  // Reemplaza esto con tu clave de API de WizModel

    const wizModelUrl = 'https://api.wizmodel.com/sdapi/v1/txt2img';

    // Concatenar ", skybox" al texto recibido
    const prompt = `${texto}, skybox`;

    const wizModelPayload = {
        prompt: prompt,
        steps: 100
    };

    const wizModelHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyWizModel}`
    };

    try {
        // Solicitar la generación de la imagen
        const wizModelResponse = await axios.post(wizModelUrl, wizModelPayload, { headers: wizModelHeaders });

        // Obtener la URL de la imagen generada
        const generatedImageUrl = wizModelResponse.data.image;  // Ajusta esto según la estructura de la respuesta de la API

        // Reescalar la imagen usando imagecdn.app
        const imageCdnUrl = 'https://api.imagecdn.app/v1/image/resize';

        const imageCdnPayload = {
            url: generatedImageUrl,
            width: 2048,
            height: 2048
        };

        const imageCdnResponse = await axios.post(imageCdnUrl, imageCdnPayload);

        // Obtener la URL de la imagen reescalada
        const resizedImageUrl = imageCdnResponse.data.url;

        // Hacer una solicitud GET para obtener la imagen reescalada
        const resizedImageResponse = await axios.get(resizedImageUrl, { responseType: 'arraybuffer' });

        res.set('Content-Type', 'image/jpeg'); // Cambia esto al tipo correcto de la imagen si es necesario
        res.send(resizedImageResponse.data);
    } catch (error) {
        console.error('Error al generar o reescalar la imagen:', error);
        res.status(500).send('Error al generar o reescalar la imagen');
    }
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
