import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface LoaderProps {
    size?: number
    color?: string
}

export default function Loader({ size = 64, color = '#5E81AC' }: LoaderProps) {
    const spinValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        )
        animation.start()
        return () => animation.stop()
    }, [spinValue])

    const rotate = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    })

    const strokeWidth = size / 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    return (
        <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={circumference * 0.25}
                    opacity={0.9}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={circumference * 0.75}
                    opacity={0.15}
                    fill="none"
                />
            </Svg>
        </Animated.View>
    )
}