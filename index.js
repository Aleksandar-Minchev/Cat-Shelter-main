import http from 'http';
import fs from 'fs/promises';
import {v4 as uuid} from 'uuid';

import homePage from './views/home/index.html.js';
import addBreedPage from './views/addBreed.html.js';
import addCatPage from './views/addCat.html.js';
import catShelterPage from './views/catShelter.html.js';
import editCatPage from './views/editCat.html.js';
import cssTemplate from './content/styles/site.css.js';

let cats = [];

initCats();

const server = http.createServer((req, res) => {
    if (req.method === 'POST'){
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = new URLSearchParams(body);

            cats.push({
                id: uuid(),
                ...Object.fromEntries(data.entries()),
            })
            saveCats();
    
            res.writeHead(302, {
                'location': '/',
            });
    
            res.end();
        });
        return;
    }

    if (req.url === '/content/styles/site.css'){
        res.writeHead(200, {
            'content-type': 'text/css'
        });
        res.write(cssTemplate);
        
        return res.end();
    }

    res.writeHead(200, {
        'content-type': 'text/html',
    });

    switch (req.url){
        case '/': res.write(homePage(cats)); break;
        case '/cats/add-breed': res.write(addBreedPage); break;
        case '/cats/add-cat': res.write(addCatPage(cats)); break;
        case '/cats/edit-cat': res.write(editCatPage); break;
        case '/cats/cat-shelter': res.write(catShelterPage); break;
    }
    
    res.end();
});

async function initCats(){
    try{
        const catsJson = await fs.readFile('./cats.json', {encoding: 'utf-8'});
        cats = JSON.parse(catsJson);
    } catch (err) {
        console.error(err.message);
    }
}

async function saveCats(){
    try{
        const catsJson = JSON.stringify(cats);
        await fs.writeFile('./cats.json', catsJson, {encoding: 'utf-8'});
    } catch (err) {
        console.error(err.message);
    }
}

server.listen(5000);

console.log('Server is listening on http://localhost:5000...');
