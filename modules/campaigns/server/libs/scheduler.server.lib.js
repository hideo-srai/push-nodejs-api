'use strict';

var path = require('path');
var moment = require('moment-timezone');
var crontab = require('node-crontab');
var chalk = require('chalk');
var pushNotificationsLib = require(path.resolve('./modules/mobile/server/libs/pushNotifications.server.lib'));

/**
 * Returns string compatible fro cron job
 * @function getCrontabString
 * @param {CampaignSchedule} scheduleObj
 * @returns {string}
 */
function getCrontabString(scheduleObj) {
  var scheduledTime = moment.tz(scheduleObj.sendDate, scheduleObj.timeZone);
  var cronArray = [];
  scheduledTime.tz(moment.tz.guess()); // set as server time zone
  cronArray.push(scheduledTime.minute());
  cronArray.push(scheduledTime.hour());
  switch (scheduleObj.repeat) {
    case 'once':
      cronArray.push(scheduledTime.date());
      cronArray.push(scheduledTime.month() + 1);
      cronArray.push(scheduledTime.day());
      break;
    case 'daily':
      cronArray.push('*');
      cronArray.push('*');
      cronArray.push('*');
      break;
    case 'weekly':
      cronArray.push('*');
      cronArray.push('*');
      cronArray.push(scheduledTime.day());
      break;
    case 'monthly':
      cronArray.push(scheduledTime.date());
      cronArray.push('*');
      cronArray.push('*');
      break;
  }
  return cronArray.join(' ');
}

/**
 * Cancels cron job
 * @function cancelJob
 * @param {CampaignSchedule} deliverySchedule
 */
function cancelJob(deliverySchedule) {
  if (deliverySchedule && deliverySchedule.jobId) {
    try {
      crontab.cancelJob(deliverySchedule.jobId);
    } catch(e) {
      console.log(chalk.red('Crontab job cancelling failed. ' + deliverySchedule.jobId));
    }
  }
}

/**
 * Called everytime push scheduled worker is called. it will close cron job if date is expired.
 * @function checkSchedule
 * @param {Campaign} campaign
 * @returns {<Promise<CampaignSchedule>}
 */
function checkSchedule(campaign) {
  var deliverySchedule = campaign.deliverySchedule;

  if (!deliverySchedule) {
    // no schedule found. just return
    return Promise.resolve();
  }

  if (campaign.expiresAt && moment().diff(campaign.expiresAt) > 0) {
    // if expiry date is set for campaign, let's close scheduled job if expired
    cancelJob(deliverySchedule);
    deliverySchedule.jobId = '';
    return deliverySchedule.save();
  }

  return Promise.resolve();
}

/**
 * We assume campaign has already campaign schedule. This function will only schedule the camapign.
 * This function is called when campaign schedule is updated OR campaign is resumed/paused, activate/deactivated.
 * @function scheduleNotifications
 * @param {Campaign} campaign
 * @param {Application} applicatin
 * @returns {Promise<CampaignSchedule>}
 */
function scheduleNotifications(campaign, application, isReschedule) {
  var deliverySchedule = campaign.deliverySchedule;

  if (!deliverySchedule) {
    throw new Error('No delivery schedule found');
  }

  // end cron job if any.
  if (deliverySchedule.jobId) {
    cancelJob(deliverySchedule);
  }

  var jobId = '';
  // schedules job
  if (deliverySchedule.frequency === 'immediate' && !isReschedule) {
    console.log(chalk.green('setting up immediate push'));
    crontab.scheduleJob('* * * * *', pushNotificationsLib.send, [application, campaign], null, false);
  } else {
    // scheduled jobs
    jobId = crontab.scheduleJob(getCrontabString(deliverySchedule), pushNotificationsLib.send, [application, campaign]);
    jobId = crontab.scheduleJob(getCrontabString(deliverySchedule), checkSchedule, [campaign]); // another scheuled job to check expired date
  }

  // saves jobId to cancel it later
  deliverySchedule.jobId = jobId;
  return deliverySchedule.save();
}

exports.checkSchedule = checkSchedule;
exports.getCrontabString = getCrontabString;
exports.scheduleNotifications = scheduleNotifications;
exports.cancelJob = cancelJob;
