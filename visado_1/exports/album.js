const ID = require('./idGenerator')

class Album {
    constructor(artistID,name,year){
        this.id = ID()
        this.artistID = artistID
        this.name = name
        this.year = year
        this.tracks = []
    }

    addTrack(trackName){
        if(!this.tracks.includes(trackName)){
          this.tracks.push(trackName)
        } else{
            throw Error("El album ya tiene ese track")
        }
    }

    hasTrack(trackName){
        return this.tracks.find(track => track.name === trackName) !== undefined
    }
    
    getTracks(){
        return this.tracks;
    }

    removeTrack(trackName){
        this.tracks = this.tracks.filter(track => track.name !== trackName)
    }

    toJSON(){
        return {
            id: this.id,
            name: this.name,
            year: this.year,
            tracks: this.tracks
        }
    }
}

module.exports = Album