'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Segment Schema
 */
var SegmentSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  name: {
    type: String,
    trim: true,
    required: 'Segment name can not be blank'
  },
  application: {
    type: Schema.ObjectId,
    ref: 'Application'
  },
  filter: {
    type: String
  }
});

mongoose.model('Segment', SegmentSchema);
