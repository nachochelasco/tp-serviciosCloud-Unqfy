let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let router = express.Router()
let fs = require('fs'); // para cargar/guarfar unqfy
let unqmod = require('./unqfy');
let errors = require('./apiErrors.js')
let controllers = require('./controllers.js')
let sendNotify = require('./monitores/observerUNQfy')

// MIDDLEWARE PARA ERRORES
let { Validator, ValidationError } = require('express-json-validator-middleware');
let validator = new Validator({allErrors: true});
let validate = validator.validate;

let ArtistSchema = {
    type: 'object',
    required: ['name', 'country'],
    properties: {
        name: {
            type: 'string'
        },
        country: {
            type: 'string'
        },
    }
}

let AlbumSchema = {
    type: 'object',
    required: ['name', 'year', 'artistId'],
    properties: {
        name: {
            type: 'string'
        },
        year: {
            type: 'number'
        },
        artistId: {
            type: 'string'
        }
    }
}

function getUNQfy(filename = 'data.json') {
    let unqfy = new unqmod.UNQfy();
    if (fs.existsSync(filename)) {
        unqfy = unqmod.UNQfy.load(filename);
    }
    return unqfy;
}

function saveUNQfy(unqfy, filename = 'data.json') {
    unqfy.save(filename);
}

//INSTANCIA DE UNQFY

let unqfy = getUNQfy();
let artistController = new controllers.ArtistController()
let albumController = new controllers.AlbumController()
let playlistController = new controllers.PlaylistController()

app.use(bodyParser.json())
app.use('/api',router)

// INVALID ROUTES

app.post('*', function(req, res) {
    const not_found = new errors.ResourceNotFound()
    res.status(404)
    res.json({status: not_found.status, errorCode: not_found.errorCode})
});

app.get('*', function(req, res) {
    const not_found = new errors.ResourceNotFound()
    res.status(404)
    res.json({status: not_found.status, errorCode: not_found.errorCode})
});

app.delete('*', function(req, res) {
    const not_found = new errors.ResourceNotFound()
    res.status(404)
    res.json({status: not_found.status, errorCode: not_found.errorCode})
});

app.put('*', function(req, res) {
    const not_found = new errors.ResourceNotFound()
    res.status(404)
    res.json({status: not_found.status, errorCode: not_found.errorCode})
});

app.patch('*', function(req, res) {
    const not_found = new errors.ResourceNotFound()
    res.status(404)
    res.json({status: not_found.status, errorCode: not_found.errorCode})
});

//Error Handler
app.use(function(err, req, res, next) {
    if (err instanceof SyntaxError || err instanceof ValidationError) {
        const error = new errors.BadRequest()
        res.status(400)
        res.json({status: 400, errorCode: error.errorCode})
        next();
    }
    else next(err);
})

// ARTISTS

router.route('/artists').get((req,res)=>{
    if(req.query.name){
        let artists = artistController.getArtistsByName(unqfy,req.query.name)
        res.json(artists)
    }else{
        res.json(artistController.getAllArtists(unqfy))
    }  
})

router.route('/artists/:id').put((req,res)=> {
    let artist = artistController.updateArtist(unqfy,res,req.params.id,req.body)

})
router.route('/artists',validate({body: ArtistSchema})).post((req,res)=>{
    artistController.createArtist(unqfy,req,res)
})

router.route('/artists/:id').get((req,res)=>{
     artistController.getArtistById(unqfy,req,res)
})

router.route('/artist/:id').patch((req,res)=>{
    let artist = artistController.updateArtist(unqfy,res,req.params.id,req.body)
})



router.route('/artists/:id').delete((req,res)=>{
    artistController.deleteArtist(unqfy,req,res)
})

////ALBUMS///

router.route('/albums',validate({body: AlbumSchema})).post((req,res)=>{  
    albumController.createAlbum(unqfy,req,res)
})

router.route('/albums/:id').get((req,res)=>{
    
    albumController.getAlbumById(unqfy,req,res)
})

///Actualizo el año de un album
router.route('/albums/:id').patch((req,res)=>{
    albumController.updateAlbum(unqfy,req,res)
})

router.route('/albums/:id').delete((req,res)=>{
    albumController.deleteAlbum(unqfy,req,res)
})

router.route('/albums').get((req,res)=>{
    if(req.query.name){
        let albums = unqfy.searchAlbumsByName(req.query.name)
        res.json(albums)
    }else{
        let albums = unqfy.getAllAlbums()
        res.json(albums.map(album => album.toJSON()))
    }    
})

/// Track ///

router.route('/tracks/:id/lyrics').get((req,res)=>{
    let idTrack = req.params.id
    try{
        let track = unqfy.getTrackById(idTrack)
         if(!track.hasLyrics()){
           let letra = unqfy.getLyricsForTrackId(idTrack)
           res.status(200)
           letra.then(()=>{
            unqfy.save('data.json')
            res.json({ Name: track.name,lyrics : track.getLyrics() })
         }).catch((e)=>{
            console.log(e.message)
            let error = new errors.ResourceNotFound()
            res.status(error.status)
            res.json({
                status: error.status,
                errorCode: error.errorCode
            })
         })
         } else {
             res.status(200)
             res.json({ Name: track.name, lyrics: track.getLyrics() })
         }
    }catch(e){
        let error = new errors.ResourceNotFound()
        res.status(error.status)
        res.json({
            status: error.status,
            errorCode: error.errorCode
        })
    }
})

/// PLAYLISTS ///

router.route('/playlists').post((req,res) => {
        if(req.body.genres){
            playlistController.createPlaylistByGenres(unqfy,req,res)
        } else{
            playlistController.createPlaylistByTracksIds(unqfy,req,res)
        }
})


router.route('/playlists/:id').get((req,res) => {
   playlistController.getPlaylistById(unqfy,req,res)
})


router.route('/playlists').get((req,res)=> {
    if((req.query.name || req.query.durationLT || req.query.durationGT)) { 
          playlistController.filterPlaylists(unqfy,req,res)
    } else{
        // let error = new errors.BadRequest()
        // res.status(error.status)
        // res.json({status:error.status,errorCode:error.errorCode})
        res.json(unqfy.playlists.map(p=>p.toJSON()))
    } 
})

router.route('/playlists/:id').delete((req,res)=>{
    playlistController.deletePlaylist(unqfy,req,res)
})


app.listen(8000, ()=>{
    console.log('Servidor corriendo en el puerto 8000')
    //sendNotify()
})
