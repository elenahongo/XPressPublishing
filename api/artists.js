const express = require('express');
const artistsRouter = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM artist WHERE is_currently_employed=1`, (err, rows) => {
        if (err) {
          next(err); 
        } else {
          res.status(200).send({artists: rows})
        }
    });
});

artistsRouter.param('artistId', (req, res, next, id) => {
    db.get(`SELECT * FROM Artist WHERE id=?`,
    {1: id}, (err, row) => {
        if(err) {
            next(err);
        } else if (row) {
            req.artist=row
            next();
        } else {
            res.sendStatus(404);
           }
        }
    );
}
);

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).send({artist: req.artist})
});

artistsRouter.post('/', (req, res, next) => {
    let newArtist = req.body.artist;
    if (!newArtist.name ||
        !newArtist.dateOfBirth || 
        !newArtist.biography) {
            return res.sendStatus(400);
        } else {
    let employed = newArtist.isCurrentlyEmployed ? newArtist.isCurrentlyEmployed : 1;
         db.run(`INSERT INTO artist (name, date_of_birth, biography, is_currently_employed) VALUES (
            $name, $date_of_birth, $biography, $employed)`,
            {$name: newArtist.name,
            $date_of_birth: newArtist.dateOfBirth,
            $biography: newArtist.biography,
            $employed: employed}, 
        function(err){
                if(err){
                    next(err)
                }
                db.get(`SELECT * FROM Artist WHERE id=${this.lastID}`, (err, row) => {
                        res.status(201).send({artist: row});
                        })
            });
}});

artistsRouter.put('/:artistId', (req, res, next) => {
    let newArtist = req.body.artist;
    if (!newArtist.name ||
      !newArtist.dateOfBirth || 
      !newArtist.biography) {
          return res.sendStatus(400);
      } else {
          let employed = newArtist.isCurrentlyEmployed ? newArtist.isCurrentlyEmployed : 1;
          db.run(`UPDATE Artist SET name=$name, date_of_birth=$date_of_birth, biography=$biography, is_currently_employed=$is_currently_employed 
          where id=$artistID`, {
            $name: newArtist.name, 
            $date_of_birth: newArtist.dateOfBirth,
            $biography: newArtist.biography,
            $is_currently_employed: employed,
            $artistID: req.artist.id
          }, function(err){
            if (err){
              next(err);
            }
          db.get(`SELECT * FROM artist WHERE id=$reqArtist`, {$reqArtist: req.artist.id}, (err, row)=>{
            res.status(200).send({artist: row});
            })
          });
        }
});

artistsRouter.delete('/:artistId', (req, res, next)=>{
  db.run(`UPDATE artist SET is_currently_employed=0 WHERE id=$artistid`, {$artistid: req.params.artistId}, (err,row) => {
    if(err) {
      next(err);
    }
      db.get(`SELECT * FROM artist WHERE id=$artistid`, {$artistid: req.params.artistId}, (err, row) => {
        res.status(200).send({artist: row})
      });
  });
});

module.exports = artistsRouter;
