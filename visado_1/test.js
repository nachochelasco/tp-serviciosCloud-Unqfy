/* eslint-env node, mocha */

const assert = require('chai').assert;
const libunqfy = require('./unqfy');
var expect = require('chai').expect;


function createAndAddArtist(unqfy, artistName, country) {
  const artist = unqfy.addArtist({ name: artistName, country });
  return artist;
}

function createAndAddAlbum(unqfy, artistName, albumName, albumYear) {
  return unqfy.addAlbum(artistName, { name: albumName, year: albumYear });
}

function createAndAddTrack(unqfy, artistName, albumName, trackName, trackDuraction, trackGenres) {
  return unqfy.addTrack(artistName, albumName , { name: trackName, duration: trackDuraction, genres: trackGenres });
}


describe('Add, remove and filter data', () => {
  let unqfy = null;

  beforeEach(() => {
    unqfy = new libunqfy.UNQfy();

    ciro = createAndAddArtist(unqfy,"Ciro","Argentina")
    azul = createAndAddAlbum(unqfy,ciro.name,"Azul",1998)
    quemado = createAndAddTrack(unqfy,ciro.name,azul.name,"Quemado",5,["rock","pop"])

    pato = createAndAddArtist(unqfy,"Pato","Argentina")
    sed = createAndAddAlbum(unqfy,pato.name,"Sed",2001)
    elNudo = createAndAddTrack(unqfy,pato.name,sed.name,"El nudo",400,["rock"])

    roberto = createAndAddArtist(unqfy,"Roberto","Uruguay")
    jueves = createAndAddAlbum(unqfy,roberto.name,"Jueves",2019)
    contraPuntoHumanoYComputadora = createAndAddTrack(unqfy,roberto.name,jueves.name,"Contrapunto Humano y Computadora",500,["rock","rap","payada"])

    rockPlaylist = unqfy.createPlaylist("Rock playlist",["rock"],1200)

  });
 context('triying to add an artist',() =>{
   it('should always add an artist', () => {
    const artist = createAndAddArtist(unqfy, 'Guns n\' Roses', 'USA');

    assert.equal(artist.name, 'Guns n\' Roses');
    assert.equal(artist.country, 'USA');

   });
   it('should failing when the artist name already exist',()=> {
    expect(function(){
      createAndAddArtist(unqfy, 'Ciro', 'Argentina')
    }).to.throw("El artista ya se encuentra en el sistema")
   })
 })
 context('triying to add an album',() => {
  it('should add an album to an artist', () => {
    const artist = createAndAddArtist(unqfy, 'Guns n\' Roses', 'USA');
    const album = createAndAddAlbum(unqfy, artist.name, 'Appetite for Destruction', 1987);

    assert.equal(album.name, 'Appetite for Destruction');
    assert.equal(album.year, 1987);
  });
  it('should failing when the artist name dont exist',()=>{
    expect(function (){
        createAndAddAlbum(unqfy, 'Persa', 'AlbumName',1900)
    }).to.throw("El artista no existe en el sistema")
  })
 })
  it('should add a track to an album', () => {
    const artist = createAndAddArtist(unqfy, 'Guns n\' Roses', 'USA');
    const album = createAndAddAlbum(unqfy, artist.name, 'Appetite for Destruction', 1987);
    const track = createAndAddTrack(unqfy, artist.name , album.name, 'Welcome to the jungle', 200, ['rock', 'hard rock']);

    assert.equal(track.name, 'Welcome to the jungle');
    assert.strictEqual(track.duration, 200);
    assert.equal(track.genres.includes('rock'), true);
    assert.equal(track.genres.includes('hard rock'), true);
    assert.lengthOf(track.genres, 2);
  });
  it('should failing when the artist name dont exist',()=>{
    expect(function() {
      createAndAddAlbum(unqfy, 'Persa', 'AlbumName',1900)
    }).to.throw("El artista no existe en el sistema")
  })
  it('should failing when the album name dont exist',()=>{
    expect(function () {
      createAndAddTrack(unqfy, 'Ciro', 'AlbumDontExistError',1900)
    }).to.throw("El Album no existe en el sistema")
  })

  it('should find different things by name', () => {
    const artist1 = createAndAddArtist(unqfy, 'Guns n\' Roses', 'USA');
    const album1 = createAndAddAlbum(unqfy, artist1.name, 'Roses Album', 1987);
    const track = createAndAddTrack(unqfy, artist1.name, album1.name, 'Roses track', 200, ['pop', 'movie']);
    const playlist = unqfy.createPlaylist('Roses playlist', ['pop'], 1400);

    const results = unqfy.searchByName('Roses');
    assert.deepEqual(results, {
      artists: [artist1],
      albums: [album1],
      tracks: [track],
      playlists: [playlist],
    });
  });

  it('should get all tracks matching genres', () => {
    const artist1 = createAndAddArtist(unqfy, 'Guns n\' Roses', 'USA');
    const album1 = createAndAddAlbum(unqfy, artist1.name, 'Appetite for Destruction', 1987);
    const t0 = createAndAddTrack(unqfy, artist1.name ,album1.name, 'Welcome to the jungle', 200, ['rock', 'hard rock', 'movie']);
    const t1 = createAndAddTrack(unqfy, artist1.name ,album1.name, 'Sweet Child o\' Mine', 500, ['rock', 'hard rock', 'pop', 'movie']);

    const artist2 = createAndAddArtist(unqfy, 'Michael Jackson', 'USA');
    const album2 = createAndAddAlbum(unqfy, artist2.name, 'Thriller', 1987);
    const t2 = createAndAddTrack(unqfy, artist2.name, album2.name, 'Trhiller', 200, ['pop', 'movie']);
    createAndAddTrack(unqfy, artist2.name ,album2.name, 'Another song', 500, ['classic']);
    const t3 = createAndAddTrack(unqfy, artist2.name, album2.name, 'Another song II', 500, ['movie']);

    const tracksMatching = unqfy.getTracksMatchingGenres(['pop', 'movie']);

    // assert.equal(tracks.matching.constructor.name, Array);
    assert.isArray(tracksMatching);
    assert.lengthOf(tracksMatching, 5);
    assert.equal(tracksMatching.includes(t0), true);
    assert.equal(tracksMatching.includes(t1), true);
    assert.equal(tracksMatching.includes(t2), true);
    assert.equal(tracksMatching.includes(t3), true);
  });

  it('should get all tracks matching artist', () => {
    const artist = createAndAddArtist(unqfy, 'Guns n\' Roses', 'USA');
    const album = createAndAddAlbum(unqfy, artist.name, 'Appetite for Destruction', 1987);
    const t1 = createAndAddTrack(unqfy, artist.name, album.name, 'Welcome to the jungle', 200, ['rock', 'hard rock']);
    const t2 = createAndAddTrack(unqfy, artist.name, album.name, 'It\'s so easy', 200, ['rock', 'hard rock']);

    const album2 = createAndAddAlbum(unqfy, artist.name, 'Use Your Illusion I', 1992);
    const t3 = createAndAddTrack(unqfy, artist.name, album2.name, 'Don\'t Cry', 500, ['rock', 'hard rock']);

    const artist2 = createAndAddArtist(unqfy, 'Michael Jackson', 'USA');
    const album3 = createAndAddAlbum(unqfy, artist2.name, 'Thriller', 1987);
    createAndAddTrack(unqfy, artist2.name, album3.name, 'Thriller', 200, ['pop', 'movie']);
    createAndAddTrack(unqfy, artist2.name, album3.name, 'Another song', 500, ['classic']);
    createAndAddTrack(unqfy, artist2.name, album3.name, 'Another song II', 500, ['movie']);

    const matchingTracks = unqfy.getTracksMatchingArtist(artist);

    assert.isArray(matchingTracks);
    assert.lengthOf(matchingTracks, 3);
    assert.isTrue(matchingTracks.includes(t1));
    assert.isTrue(matchingTracks.includes(t2));
    assert.isTrue(matchingTracks.includes(t3));
  });
});

describe('Playlist Creation and properties', () => {
  let unqfy = null;

  beforeEach(() => {
    unqfy = new libunqfy.UNQfy();
  });

  it('should create a playlist as requested', () => {
    const artist = createAndAddArtist(unqfy, 'Guns n\' Roses', 'USA');
    const album = createAndAddAlbum(unqfy, artist.name, 'Appetite for Destruction', 1987);
    const t1 = createAndAddTrack(unqfy, artist.name, album.name, 'Welcome to the jungle', 200, ['rock', 'hard rock', 'movie']);
    createAndAddTrack(unqfy, artist.name, album.name, 'Sweet Child o\' Mine', 1500, ['rock', 'hard rock', 'pop', 'movie']);

    const artist2 = createAndAddArtist(unqfy, 'Michael Jackson', 'USA');
    const album2 = createAndAddAlbum(unqfy, artist2.name, 'Thriller', 1987);
    const t2 = createAndAddTrack(unqfy, artist2.name, album2.name, 'Thriller', 200, ['pop', 'movie']);
    const t3 = createAndAddTrack(unqfy, artist2.name, album2.name, 'Another song', 500, ['pop']);
    const t4 = createAndAddTrack(unqfy, artist2.name, album2.name, 'Another song II', 500, ['pop']);

    const playlist = unqfy.createPlaylist('my playlist', ['pop', 'rock'], 1400);

    assert.equal(playlist.name, 'my playlist');
    assert.isAtMost(playlist.duration(), 1400);
    assert.isTrue(playlist.hasTrack(t1));
    assert.isTrue(playlist.hasTrack(t2));
    assert.isTrue(playlist.hasTrack(t3));
    assert.isTrue(playlist.hasTrack(t4));
    assert.lengthOf(playlist.tracks, 4);
  });
});
