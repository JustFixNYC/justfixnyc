'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Q = require('q'),
    rollbar = require('rollbar'),
    Referral = mongoose.model('Referral');


 /*

      validate
        takes a code, returns an advocate _id



 */



var search = function(query) {

  var deferred = Q.defer();

  // just for convinience - allows you to do ?code= instead of ?codes=
  // if(query.code) {
  //   query.codes = query.code;
  //   delete query.code;
  // }

	Referral.find(query, function(err, referrals) {
		if(err) {
      deferred.reject(err);
		} else {
			deferred.resolve(referrals);
		}
	});

  return deferred.promise;
};


exports.create = function(req, res) {

  var newReferral = new Referral(req.body);
  var numCodes = parseInt(newReferral.totalUsers);
  var code = newReferral.code;

  var query = { code: code };

  search(query)
    .then(function(r) {

      // check for duplicates
      if (r.length > 0) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage("This code already exists. Try again!")
        });
      } else {
        newReferral.save(function (err, referral) {
          if(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            console.log(referral);
            return res.jsonp(referral);
          }
        });
      }

    }).fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};


exports.list = function(req, res) {

  search(req.query)
    .then(function(referrals) {
      res.json(referrals);
    }).fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};


exports.validate = function(req, res) {

  // limit query to just code for security
  var query = { code: req.query.code };

  search(query)
    .then(function(r) {
      if (r.length > 1) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage("Multiple referrals for a single code - this shouldn't happen.")
        });
      } else if (r.length == 0) {
        var err = new Error("Invalid Access Code");
        rollbar.handleErrorWithPayloadData(err, { level: "error", custom: query }, req);
        res.json({ referral: null });
      } else if (r[0].totalUsers == r[0].inUse) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage("Maximum number of users reached for this referral, sorry!")
        });
      } else {

        var newReferral = {
          email: r[0].email,
          phone: r[0].phone,
          organization: r[0].organization,
          name: r[0].name,
          code: r[0].code
        };

        // increment 'inUse' variable
        Referral.findOneAndUpdate({ _id: r[0]._id }, { $inc: { inUse : 1 } },
          function(err, referral) {
            if(err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json({ referral: newReferral });
            }
          });
      }
    }).fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};


exports.remove = function(req, res) {

  if(!req.query.id) {
    return res.status(400).send({ message: errorHandler.getErrorMessage('No referral ID given.') });
  }

  Referral.remove({ _id: req.query.id }, function(err) {
    if(err) {
			res.status(400).send({ message: errorHandler.getErrorMessage('Problem with deleting a referral:', req.query.id) });
		} else {
      res.json({ message: 'Referral deleted.' });
    }
  });
};
