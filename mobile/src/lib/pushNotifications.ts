import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        return null
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== 'granted') {
        return null
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
        })
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId })
    return tokenResponse.data
}