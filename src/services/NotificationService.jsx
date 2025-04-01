// src/services/NotificationService.js
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.configure();
    this.lastId = 0;
  }

  configure = () => {
    // Configure the notification channel for Android
    PushNotification.createChannel(
      {
        channelId: 'medicine-reminders',
        channelName: 'Medicine Reminders',
        channelDescription: 'Notifications for medicine reminders',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    // Configure notifications
    PushNotification.configure({
      // Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Required on iOS only
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      // IOS ONLY: Permission to use notifications
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // Request permissions on app start
      requestPermissions: Platform.OS === 'ios',
    });
  };

  // Get a unique notification ID
  getNotificationId = async () => {
    const currentId = await AsyncStorage.getItem('lastNotificationId') || '0';
    const newId = (parseInt(currentId) + 1).toString();
    await AsyncStorage.setItem('lastNotificationId', newId);
    return newId;
  };

  // Schedule a notification for a medicine reminder
  scheduleNotification = async (medicine, reminderTime) => {
    try {
      // Parse reminder time
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      // Get notification ID
      const notificationId = await this.getNotificationId();
      
      // Calculate dates
      const startDate = new Date(medicine.startDate);
      const endDate = new Date(medicine.endDate);
      
      // Format time for display
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Schedule the notification
      PushNotification.localNotificationSchedule({
        // Android specific properties
        channelId: 'medicine-reminders',
        smallIcon: 'ic_notification',
        largeIcon: '',
        
        // Common properties
        id: notificationId,
        title: 'Medicine Reminder',
        message: `Time to take ${medicine.name} (${medicine.dosage})`,
        userInfo: { medicineId: medicine.id },
        
        // Schedule properties
        date: this.getFirstAlarmDate(startDate, hours, minutes),
        allowWhileIdle: true,
        repeatType: this.getRepeatType(medicine.scheduleType),
        repeatTime: this.getRepeatTime(medicine.scheduleType),
        endDate: endDate,
      });
      
      // Store notification ID for future reference (if needed to cancel)
      await this.storeMedicineNotification(medicine.id, notificationId, timeString);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };
  
  // Get the first alarm date based on start date and time
  getFirstAlarmDate = (startDate, hours, minutes) => {
    const now = new Date();
    const alarmDate = new Date(startDate);
    alarmDate.setHours(hours, minutes, 0, 0);
    
    // If the start date is in the past, adjust to today or tomorrow
    if (alarmDate < now) {
      const todayAlarm = new Date();
      todayAlarm.setHours(hours, minutes, 0, 0);
      
      // If today's alarm time has already passed, schedule for tomorrow
      if (todayAlarm < now) {
        todayAlarm.setDate(todayAlarm.getDate() + 1);
      }
      
      return todayAlarm;
    }
    
    return alarmDate;
  };
  
  // Convert schedule type to notification repeat type
  getRepeatType = (scheduleType) => {
    switch (scheduleType.toLowerCase()) {
      case 'daily':
        return 'day';
      case 'weekly':
        return 'week';
      default:
        return 'day'; // Default to daily
    }
  };
  
  // Get repeat time for custom schedules
  getRepeatTime = (scheduleType) => {
    // This could be expanded for more complex schedules
    // For now, we're using standard repeat types
    return 1;
  };
  
  // Store notification IDs for a medicine
  storeMedicineNotification = async (medicineId, notificationId, reminderTime) => {
    try {
      // Get existing notifications for this medicine
      const notificationsJson = await AsyncStorage.getItem(`notifications_${medicineId}`);
      let notifications = notificationsJson ? JSON.parse(notificationsJson) : {};
      
      // Add this notification
      notifications[reminderTime] = notificationId;
      
      // Store updated notifications
      await AsyncStorage.setItem(`notifications_${medicineId}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification ID:', error);
    }
  };
  
  // Schedule all reminders for a medicine
  scheduleAllReminders = async (medicine) => {
    const notificationIds = [];
    
    for (const reminderTime of medicine.reminderTimes) {
      const id = await this.scheduleNotification(medicine, reminderTime);
      notificationIds.push(id);
    }
    
    return notificationIds;
  };
  
  // Cancel notifications for a medicine
  cancelMedicineNotifications = async (medicineId) => {
    try {
      const notificationsJson = await AsyncStorage.getItem(`notifications_${medicineId}`);
      if (notificationsJson) {
        const notifications = JSON.parse(notificationsJson);
        
        // Cancel each notification
        Object.values(notifications).forEach(id => {
          PushNotification.cancelLocalNotification(id.toString());
        });
        
        // Remove from storage
        await AsyncStorage.removeItem(`notifications_${medicineId}`);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };
  
  // Check notification permissions
  checkPermissions = async () => {
    return new Promise((resolve) => {
      PushNotification.checkPermissions(permissions => {
        resolve(permissions);
      });
    });
  };
  
  // Request notification permissions
  requestPermissions = async () => {
    return new Promise((resolve) => {
      PushNotification.requestPermissions(permissions => {
        resolve(permissions);
      });
    });
  };
}

export default new NotificationService();