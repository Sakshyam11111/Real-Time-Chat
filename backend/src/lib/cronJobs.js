// lib/cronJobs.js
import cron from 'node-cron';
import Story from '../models/story.model.js';

// Run every hour to clean up expired stories
export const setupStoryCleanup = () => {
  // Schedule: Run every hour (0 * * * *)
  // For testing, you can use '*/5 * * * *' to run every 5 minutes
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🧹 Running story cleanup job...');
      
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await Story.deleteMany({
        createdAt: { $lt: twentyFourHoursAgo }
      });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Deleted ${result.deletedCount} expired stories`);
      } else {
        console.log('✅ No expired stories to delete');
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired stories:', error);
    }
  }, {
    scheduled: true,
    timezone: "UTC" // Use UTC timezone for consistency
  });
  
  // Also run cleanup on server startup
  setTimeout(async () => {
    try {
      console.log('🧹 Running initial story cleanup...');
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await Story.deleteMany({
        createdAt: { $lt: twentyFourHoursAgo }
      });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Initial cleanup: Deleted ${result.deletedCount} expired stories`);
      } else {
        console.log('✅ Initial cleanup: No expired stories found');
      }
    } catch (error) {
      console.error('❌ Error in initial story cleanup:', error);
    }
  }, 5000); // Wait 5 seconds after server start
  
  console.log('📅 Story cleanup cron job scheduled (runs every hour)');
};

// Optional: Function to manually trigger cleanup (useful for testing)
export const manualStoryCleanup = async () => {
  try {
    console.log('🧹 Manual story cleanup triggered...');
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Story.deleteMany({
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    console.log(`✅ Manual cleanup: Deleted ${result.deletedCount} expired stories`);
    return result;
  } catch (error) {
    console.error('❌ Error in manual story cleanup:', error);
    throw error;
  }
};