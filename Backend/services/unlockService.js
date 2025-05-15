const cron = require("node-cron");
const Timeline = require("../models/timeline");
const { sendEmailNotification } = require("./emailService");

/**
 * Service to notify users when their timeline entries are unlocked
 * Runs every 10 minutes to check for newly unlocked entries
 */
exports.unlockNotifier = () => {
  // Run every 10 minutes instead of every minute to reduce database load
  // "*/10 * * * *" = At every 10th minute
  cron.schedule('*/10 * * * *', async () => { 
    console.log("🔄 Checking for unlocked entries...");

    const now = new Date();
    try {
      // Add index hint if you have an index on these fields
      // Add projection to only fetch fields we need
      const timelines = await Timeline.find({
        unlockAt: { $lte: now },
        isNotified: false,
      })
      .select('user title unlockAt')  // Only select fields we need
      .populate('user', 'email')      // Only populate email field from user
      .limit(100);                    // Limit batch size for performance

      if (timelines.length === 0) {
        return console.log("✅ Unlock Notifier: No new entries to notify.");
      }

      // Prepare bulk operations to update all entries at once
      const bulkOps = [];
      const notificationPromises = [];

      for (const timeline of timelines) {
        if (timeline.user?.email) {
          // Queue email notification
          notificationPromises.push(
            sendEmailNotification(timeline.user.email, timeline.title)
              .catch(err => console.error(`Failed to send email for timeline ${timeline._id}:`, err))
          );
          
          // Queue database update
          bulkOps.push({
            updateOne: {
              filter: { _id: timeline._id },
              update: { $set: { isNotified: true } }
            }
          });
        }
      }

      // Send all notifications in parallel
      await Promise.allSettled(notificationPromises);
      
      // Perform bulk update if we have operations
      if (bulkOps.length > 0) {
        await Timeline.bulkWrite(bulkOps);
      }

      console.log(`✅ Unlock Notifier: ${notificationPromises.length} notifications sent, ${bulkOps.length} entries marked as notified.`);
    } catch (error) {
      console.error("❌ Unlock Notifier Error:", error);
    }
  });
};