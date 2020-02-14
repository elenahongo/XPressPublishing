const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = require('./issues');

  seriesRouter.param('seriesId', (req, res, next, id)=> {
    db.get(`SELECT * FROM Series WHERE id=$seriesId`, {$seriesId: id}, (err, row) => {
      if(err){
        next(err);
      } else if (row) {
        req.series=row
        next();
      } else {
        res.sendStatus(404);
      };
    });
  });

  seriesRouter.get('/', (req, res, next) =>{
        db.all(`SELECT * from series`, (err, rows) => {
          if(err) {
            next(err);
          }
          res.status(200).send({series: rows})
        });
      });

  seriesRouter.get('/:seriesId', (req, res, next)=>{
      res.status(200).send({series: req.series});
    });

  seriesRouter.post('/', (req, res, next) => {
    let newSerie = req.body.series
    if(!newSerie.name || !newSerie.description){
      res.sendStatus(400);
    } else {
      db.run(`INSERT INTO series (name, description) VALUES ($name, $description)`, {
        $name: newSerie.name, 
        $description: newSerie.description},
        function(err){
          if(err){
            next(err);
          } 
          db.get(`SELECT * FROM series WHERE id=${this.lastID}`, (err, row) => {
            res.status(201).send({series: row});
          })
        }
        )};
  });

  seriesRouter.put('/:seriesId', (req, res, next)=>{
    let newSerie = req.body.series;
    if (!newSerie.name || !newSerie.description) {
      res.sendStatus(400);
    } else {
      db.run(`UPDATE series SET name=$name, description=$description WHERE id=$id`, {
        $name: newSerie.name, 
        $description: newSerie.description, 
        $id:req.params.seriesId
      }, (err, row) => {  
        if(err){
          next(err);
        } else {
          db.get(`SELECT * FROM series WHERE id=$id`,{$id:req.params.seriesId}, (err, row)=>{
            res.status(200).send({series: row});
          })
        }
      }
      
      );
    };
  });
    
  seriesRouter.use('/:seriesId/issues', issuesRouter);

  
seriesRouter.delete('/:seriesId', (req, res, next)=> {
  db.get(`SELECT * FROM issue WHERE series_id=$seriesId`, {$seriesId: req.params.seriesId}, (err, row)=> {
    if(err){
      next(err);
    } else if (row) {
      return res.sendStatus(400);        
    } else {
      db.run(`DELETE FROM series WHERE id=$id`, {$id: req.params.seriesId}, (err, row) =>{
        if(err){
          next(err)
        } 
        res.sendStatus(204);
      })
    }
  });
}); 


module.exports = seriesRouter;