'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Activity Schema
 */
var ActivitySchema = new Schema({

    startDate: {
      type: Date,
      default: Date.now
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    key: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    photos: [{
      url : { type : String}, 
      thumb : { type : String}, 
      created : { type : Date, default : Date.now }
    }],
    fields: [{
      title: { type: String },
      value: { type: String }
    }],
    relatedProblems: [{
			type: Schema.Types.ObjectId,
			ref: 'Problem'
		}],
    problems: {
      type: Schema.Types.Mixed,
      default: {}
    }
});

module.exports = ActivitySchema;
