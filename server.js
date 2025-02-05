const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/view', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
        return res.status(400).send("URL parameter is missing");
    }
    
    try {
        const response = await axios.get(url);
        
        if (response.status !== 200) {
            return res.status(500).send(`Failed to fetch the website. Status code: ${response.status}`);
        }
        return res.type('html').send(response.data);
    } catch (err) {
        return res.status(500).send(`Request error: ${err.message}`);
    }
});

app.get('/script', async (req, res) => {
    const url = req.query.url;
    const source = req.query.source;
    
    if (!url) {
        return res.status(400).send("URL parameter is missing");
    }
    
    if (!source) {
        return res.status(400).send("Source parameter is missing");
    }

    try {
        const response = await axios.get(url);
        
        if (response.status !== 200) {
            return res.status(500).send(`Failed to fetch the website. Status code: ${response.status}`);
        }
        
        const $ = cheerio.load(response.data);
        let code = '';

        if (source === 'html') {
            code = $.html();
        } else if (source === 'css') {
            $('style').each((i, el) => {
                code += $(el).html() + '\n';
            });
            $('link[rel="stylesheet"]').each(async (i, el) => {
                const cssUrl = $(el).attr('href');
                if (cssUrl) {
                    try {
                        const cssResponse = await axios.get(cssUrl);
                        if (cssResponse.status === 200) {
                            code += cssResponse.data + '\n';
                        }
                    } catch (cssErr) {
                        console.log(`Error fetching CSS from ${cssUrl}: ${cssErr.message}`);
                    }
                }
            });
        } else if (source === 'js') {
            $('script').each((i, el) => {
                if ($(el).html()) {
                    code += $(el).html() + '\n';
                }
            });
            $('script[src]').each(async (i, el) => {
                const jsUrl = $(el).attr('src');
                if (jsUrl) {
                    try {
                        const jsResponse = await axios.get(jsUrl);
                        if (jsResponse.status === 200) {
                            code += jsResponse.data + '\n';
                        }
                    } catch (jsErr) {
                        console.log(`Error fetching JS from ${jsUrl}: ${jsErr.message}`);
                    }
                }
            });
        } else {
            return res.status(400).send("Invalid source parameter. Valid options are 'html', 'css', 'js'.");
        }
        
        if (!code.trim()) {
            return res.status(404).send(`${source} code is not available`);
        }

        return res.type('text/plain').send(code);
    } catch (err) {
        return res.status(500).send(`An error occurred: ${err.message}`);
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
