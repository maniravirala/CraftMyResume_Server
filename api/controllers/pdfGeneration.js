const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const Links = {
    API: {
        REQUEST_PDF: 'https://api.tailwindstream.io/request',
        RETRY_PDF: 'https://api.tailwindstream.io/request/:requestId/download',
    },
};

exports.generatePdf = async (req, res) => {
    const { html } = req.body;

    const newHtml = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <link rel="stylesheet" href="https://use.typekit.net/umf5tls.css">
    </head>
    <body>
    ${html}
    </body>
    </html>`;


    try {
        const response = await requestDownload({ html: newHtml });
        if (response.error) {
            return res.status(500).send(response.error);
        }
        if (response.requestId) {
            res.send({
                status: 'success',
                downloadUrl: response.downloadUrl
            });
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send({
            error: 'An error occurred while generating the PDF'
        });
    }
}

async function requestDownload(payload) {
    const response = await fetch(Links.API.REQUEST_PDF, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to request PDF generation');
    }
    return data;
}
