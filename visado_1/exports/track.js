class Track {
    constructor(_albumID,_trackName,_trackDuration,_trackGenre){
        this.albumID = _albumID
        this.name = _trackName
        this.duration = _trackDuration
        this.genres = [_trackGenre]
    }
    addGenre(genreName){
        if(!this.genres.includes(genreName)){
            this.genres.push(genreName)
        } else{
            throw Error("El track ya tiene ese genero")
        }
    }

    hasGenre(genreName){
        return this.genres.includes(genreName)
    }
}