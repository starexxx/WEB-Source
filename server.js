const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/view', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
        return res.status(400).json({ error: "URL parameter is missing" });
    }
    
    try {
        const response = await axios.get(url);
        
        if (response.status !== 200) {
            return res.status(500).json({ error: `Failed to fetch the website. Status code: ${response.status}` });
        }
        return res.type('html').send(response.data);
    } catch (err) {
        return res.status(500).json({ error: `Request error: ${err.message}` });
    }
});

app.get('/script', async (req, res) => {
    const url = req.query.url;
    const source = req.query.source;
    
    if (!url) {
        return res.status(400).json({ error: "URL parameter is missing" });
    }

    try {
        const response = await axios.get(url);
        
        if (response.status !== 200) {
            return res.status(500).json({ error: `Failed to fetch the website. Status code: ${response.status}` });
        }
        
        const $ = cheerio.load(response.data);
        let htmlCode = $.html();
        let cssCode = "";
        let jsCode = "";

        $('style').each((i, el) => {
            cssCode += $(el).html() + '\n';
        });

      
        const cssLinks = $('link[rel="stylesheet"]').map((i, el) => $(el).attr('href')).get();

        $('script').each((i, el) => {
            if ($(el).html()) {
                jsCode += $(el).html() + '\n';
            }
        });
        const jsLinks = $('script[src]').map((i, el) => $(el).attr('src')).get();

        for (const cssUrl of cssLinks) {
            try {
                const cssResponse = await axios.get(cssUrl);
                if (cssResponse.status === 200) {
                    cssCode += cssResponse.data + '\n';
                }
            } catch (cssErr) {
                console.log(`Error fetching CSS from ${cssUrl}: ${cssErr.message}`);
            }
        }
        for (const jsUrl of jsLinks) {
            try {
                const jsResponse = await axios.get(jsUrl);
                if (jsResponse.status === 200) {
                    jsCode += jsResponse.data + '\n';
                }
            } catch (jsErr) {
                console.log(`Error fetching JS from ${jsUrl}: ${jsErr.message}`);
            }
        }

        let finalCode = '';

        if (!source) {
            finalCode = `<!-- HTML -->\n${htmlCode}\n\n/* CSS */\n${cssCode}\n\n// JS\n${jsCode}`;
        } else if (source === 'html') {
            finalCode = htmlCode;
        } else if (source === 'css') {
            finalCode = cssCode;
        } else if (source === 'js') {
            finalCode = jsCode;
        } else {
            return res.status(400).json({ error: "Invalid source parameter. Valid options are 'html', 'css', 'js'." });
        }

        if (!finalCode.trim()) {
            return res.status(404).json({ error: `${source || 'All'} code is not available` });
        }

        return res.type('text/plain').send(finalCode);
    } catch (err) {
        return res.status(500).json({ error: `An error occurred: ${err.message}` });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
