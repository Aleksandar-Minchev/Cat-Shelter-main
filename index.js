import http from 'http';
import fs from 'fs/promises';
import {v4 as uuid} from 'uuid';

import homePage from './views/home/index.html.js';
import addBreedPage from './views/addBreed.html.js';
import addCatPage from './views/addCat.html.js';
import catShelterPage from './views/catShelter.html.js';
import editCatPage from './views/editCat.html.js';
import cssTemplate from './content/styles/site.css.js';
import { log } from 'console';

let cats = [];
let breeds = [];

initCats();

const server = http.createServer((req, res) => {
    const pathname = req.url;
    if (req.method === 'POST'){
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = new URLSearchParams(body);

            if (pathname === '/cats/add-cat'){                
                cats.push({
                    id: uuid(),
                    ...Object.fromEntries(data.entries()),
                })
                saveCats();
            } else if (pathname === '/cats/add-breed'){
                breeds.push(Object.fromEntries(data.entries()));
                saveBreeds();
            } else if (pathname.includes('/cats/edit-cat/')) {
                const id = pathname.split('/cats/edit-cat/')[1];
                let curCat = cats.find(cat => cat.id === id);                
                Object.assign(curCat, {
                    id: id,
                    ...Object.fromEntries(data.entries())
                })
                saveCats();                         

            } else if (pathname.includes('/cats/cat-shelter/')) {
                // const id = pathname.split('/cats/cat-shelter/')[1];
                // const curCat = cats.find(cat => cat.id == id);

            }
    
            res.writeHead(302, {
                'location': '/',
            });
    
            res.end();
        });
        return;
    }

    if (pathname === '/content/styles/site.css' || pathname === '/cats/content/styles/site.css'){
        res.writeHead(200, {
            'content-type': 'text/css'
        });
        res.write(cssTemplate);
        
        return res.end();
    }

    res.writeHead(200, {
        'content-type': 'text/html',
    });
    
    switch (pathname){
        case '/': res.write(homePage(cats)); break;
        case '/cats/add-breed': res.write(addBreedPage); break;
        case '/cats/add-cat': res.write(addCatPage(breeds)); break;
        default:
            if (pathname.includes('/cats/edit-cat/') && req.method === 'GET'){
                const id = pathname.split('/cats/edit-cat/')[1];
                const curCat = cats.find(cat => cat.id == id);                              
                res.write(editCatPage(curCat, breeds))
        
            } else if (pathname.includes('/cats/cat-shelter/') && req.method === 'GET'){
                const id = pathname.split('/cats/cat-shelter/')[1];
                const curCat = cats.find(cat => cat.id == id);                              
                res.write(catShelterPage(curCat));              
            } 
    }
    
    res.end();
});

async function initCats(){
    try{
        const catsJson = await fs.readFile('./cats.json', {encoding: 'utf-8'});
        cats = JSON.parse(catsJson);
        const breedsJson = await fs.readFile('./breeds.json', {encoding: 'utf-8'});
        breeds = JSON.parse(breedsJson);
    } catch (err) {
        console.error(err.message);
    }
}

async function saveCats(){
    try{
        const catsJson = JSON.stringify(cats, null, 2);
        await fs.writeFile('./cats.json', catsJson, {encoding: 'utf-8'});
    } catch (err) {
        console.error(err.message);
    }
}

async function saveBreeds(){
    try{
        const breedsJson = JSON.stringify(breeds, null, 2);
        await fs.writeFile('./breeds.json', breedsJson, {encoding: 'utf-8'});
    } catch (err) {
        console.error(err.message);
    }
}

// async function editCat(){
//     try{
//         const catsJson = await fs.readFile('./cats.json', {encoding: 'utf-8'});
//         cats = JSON.parse(catsJson);
//         const breedsJson = await fs.readFile('./breeds.json', {encoding: 'utf-8'});
//         breeds = JSON.parse(breedsJson);
//     } catch (err) {
//         console.error(err.message);
//     }
// }

server.listen(5000);

console.log('Server is listening on http://localhost:5000...');
