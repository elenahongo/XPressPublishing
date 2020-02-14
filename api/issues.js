const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



issuesRouter.param('issueId', (req, res, next) => {
  db.get(`SELECT * FROM issue WHERE id=$id_issue`, {$id_issue: req.params.issueId}, (err, row) => {
    if(err){
      next(err)
    } else if (!row) {
      return res.sendStatus(404);
    } else {
      next();
    }
  });
});

    issuesRouter.get('/', (req, res, next) => {
        db.all(`SELECT * FROM Issue WHERE series_id=$seriesid`, {$seriesid: req.params.seriesId}, (err, rows) => {
            if(err){
                next(err);
            } else {
            res.status(200).send({issues: rows});
            }
        });        
    });

    issuesRouter.post('/', (req, res, next) => {
      let newIssue = req.body.issue    
      
      if (!newIssue.name || 
        !newIssue.issueNumber || 
        !newIssue.publicationDate ||
        !newIssue.artistId) {
          return res.sendStatus(400);
        } else {

      db.get(`SELECT * FROM artist WHERE id=$artistId`, {$artistId: newIssue.artistId}, (err, row) => {
        if (err){
          res.sendStatus(400);
          next(err);
        } else {
          db.run(`INSERT INTO issue(name, 
            issue_number, 
            publication_date, 
            artist_id,
            series_id) VALUES ($name, 
              $issueNumber, 
              $publicationDate, 
              $artistId,
              $seriesId)`, {
                $name: newIssue.name, 
                $issueNumber: newIssue.issueNumber, 
                $publicationDate: newIssue.publicationDate, 
                $artistId: newIssue.artistId,
                $seriesId: req.params.seriesId
              }, function(err)  {
                  if(err) {
                    next(err);
                  }
                  db.get(`SELECT * FROM issue WHERE id=${this.lastID}`, (err, row) => {
                    res.status(201).send({issue: row});
                  })
              })
          }
        });
      } 
    });

issuesRouter.put('/:issueId', (req, res, next) => {
  let newIssue = req.body.issue;
  if (!newIssue.name || 
      !newIssue.issueNumber || 
      !newIssue.publicationDate ||
      !newIssue.artistId) {
      return res.sendStatus(400);
    } else {
      db.get(`SELECT * FROM artist WHERE id=$artistId`, {$artistId: newIssue.artistId}, (err, row) => {
        if (err){
          next(err);
        } else if (!row) {
          res.sendStatus(404);
        } else {
          db.run(`UPDATE issue SET name=$name, issue_number=$issueNumber, publication_date=$publicationDate, artist_id=$artistId WHERE id=$issueId`, {
            $name: newIssue.name, 
            $issueNumber: newIssue.issueNumber, 
            $publicationDate: newIssue.publicationDate, 
            $artistId: newIssue.artistId,
            $issueId: req.params.issueId
          }, function(err) {
            if(err){
            next(err);
          }
            db.get(`SELECT * FROM issue WHERE id=$id`, {$id: req.params.issueId}, (err, row) =>{
              res.status(200).send({issue: row});
            });
          });
    };
  });
}})

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.get(`SELECT * FROM issue WHERE id=$id`, {$id: req.params.issueId}, (err, row) => {
    if (err){
      next(err);
    }
else if (!row) {
  return res.sendStatus(404);
} else {
  db.run(`DELETE FROM issue WHERE id=$id`, {$id: req.params.issueId}, (err, row) => {
    if(err){
      next(err);
    } 
    res.sendStatus(204);
  });}    

  })
});


module.exports = issuesRouter;
