import { useEffect, useRef } from 'react'
import { Animated, Easing, Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'

interface EmptyStateProps {
    message: string
    IconComponent: LucideIcon
}

export default function EmptyState({ message, IconComponent }: EmptyStateProps) {
    const rotateValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(rotateValue, { toValue: 1, duration: 150, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(rotateValue, { toValue: -1, duration: 300, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(rotateValue, { toValue: 0, duration: 150, easing: Easing.linear, useNativeDriver: true }),
                Animated.delay(1500),
            ])
        )
        animation.start()
        return () => animation.stop()
    }, [rotateValue])

    const rotate = rotateValue.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-12deg', '12deg'],
    })

    return (
        <View className="flex-1 items-center justify-center py-16">
            <Animated.View style={{ transform: [{ rotate }] }}>
                <IconComponent size={48} color="#5E81AC" strokeWidth={1} />
            </Animated.View>
            <Text className="text-neutral mt-4">{message}</Text>
        </View>
    )
}