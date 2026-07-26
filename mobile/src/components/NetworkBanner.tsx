import { useEffect, useState } from 'react'
import { Animated, Text, View } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { WifiOff } from 'lucide-react-native'

export default function NetworkBanner() {
    const [status, setStatus] = useState<'online' | 'offline' | 'slow'>('online')
    const heightAnim = useState(new Animated.Value(0))[0]

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                setStatus('offline')
            } else if (state.type === 'cellular' && state.details?.cellularGeneration === '2g') {
                setStatus('slow')
            } else if (state.isInternetReachable === false) {
                setStatus('offline')
            } else {
                setStatus('online')
            }
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        Animated.timing(heightAnim, {
            toValue: status === 'online' ? 0 : 36,
            duration: 250,
            useNativeDriver: false,
        }).start()
    }, [status])

    if (status === 'online') return null

    return (
        <Animated.View
            style={{
                height: heightAnim,
                overflow: 'hidden',
                backgroundColor: status === 'offline' ? '#BF616A' : '#EBCB8B',
            }}
        >
            <View className="flex-1 flex-row items-center justify-center gap-2">
                <WifiOff size={14} color="#fff" />
                <Text className="text-white text-xs font-medium">
                    {status === 'offline' ? 'Aucune connexion internet' : 'Connexion lente'}
                </Text>
            </View>
        </Animated.View>
    )
}