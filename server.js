const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// ROUTE TO VIEW THE COMPLETE HTML OF A WEBPAGE (OPTIONAL)
/*

app.get('/iframe', async (req, res) => {
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
*/

// ROUTE TO EXTRACT AND COMBINE HTML, CSS, AND JAVASCRIPT CODE FROM A WEBPAGE
app.get('/source', async (req, res) => {
    const url = req.query.url;
    const source = req.query.source; // OPTIONAL PARAMETER TO FILTER BY SOURCE TYPE
    
    if (!url) {
        return res.status(400).json({ error: "URL parameter is missing" });
    }

    try {
        // FETCH THE WEBPAGE
        const response = await axios.get(url);
        
        if (response.status !== 200) {
            return res.status(500).json({ error: `Failed to fetch the website. Status code: ${response.status}` });
        }
        
        // LOAD HTML INTO CHEERIO FOR PARSING
        const $ = cheerio.load(response.data);
        let htmlCode = $.html(); // Get complete HTML
        let cssCode = "";
        let jsCode = "";

        // EXTRACT INLINE STYLES
        $('style').each((i, el) => {
            cssCode += $(el).html() + '\n';
        });

        // EXTRACT EXTERNAL CSS LINKS
        const cssLinks = $('link[rel="stylesheet"]').map((i, el) => $(el).attr('href')).get();
        $('script').each((i, el) => {
            if ($(el).html()) {
                jsCode += $(el).html() + '\n';
            }
        });
        
        // EXTRACT EXTERNAL JAVASCRIPT LINKS
        const jsLinks = $('script[src]').map((i, el) => $(el).attr('src')).get();

        // FETCH AND COMBINE EXTERNAL CSS FILES
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
        
        // FETCH AND COMBINE EXTERNAL JAVASCRIPT FILES
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

        // DETERMINE WHAT CODE TO RETURN BASED ON SOURCE PARAMETER
        if (!source) {
            // RETURN ALL CODE IF NO SOURCE SPECIFIED
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

        // IF THERE'S ANY CODE TO RETURN
        if (!finalCode.trim()) {
            return res.status(404).json({ error: `${source || 'All'} code is not available` });
        }

        // RETURN THE CODE AS PLAIN TEXT
        return res.type('text/plain').send(finalCode);
    } catch (err) {
        return res.status(500).json({ error: `An error occurred: ${err.message}` });
    }
});

// START THE SERVER at localhost:3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
